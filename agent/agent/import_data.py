
"""
菜谱数据导入模块（HowToCook）
"""
import os
import re
from typing import List, Dict

# 文件夹名 → 中文分类
CATEGORY_NAMES = {
    "aquatic": "水产",
    "breakfast": "早餐",
    "condiment": "调料",
    "dessert": "甜品",
    "drink": "饮品",
    "meat_dish": "荤菜",
    "semi-finished": "半成品加工",
    "soup": "汤与粥",
    "staple": "主食",
    "vegetable_dish": "素菜",
}


class RecipeImportData:
    """菜谱数据导入器"""

    def __init__(self, dishes_dir: str):
        self.dishes_dir = dishes_dir

    def load_and_prepare(self) -> List[Dict]:
        """遍历 dishes 目录，一个 .md 文件就是一道菜"""
        recipes = []
        for root, _, files in os.walk(self.dishes_dir):
            for name in files:
                if not name.endswith(".md"):
                    continue
                path = os.path.join(root, name)
                # 取第一层目录名作为分类，例如 aquatic/小龙虾/小龙虾.md → aquatic
                category_key = os.path.relpath(path, self.dishes_dir).split(os.sep)[0]
                if category_key == "template":
                    continue

                with open(path, encoding="utf-8") as f:
                    text = f.read()

                recipes.append({
                    "text": text,
                    "metadata": {
                        "dish_name": self._parse_name(text, name),
                        "category": CATEGORY_NAMES.get(category_key, category_key),
                        "difficulty": self._parse_difficulty(text),
                    },
                })

        print(f"成功加载 {len(recipes)} 道菜谱")
        return recipes

    def _parse_name(self, text: str, filename: str) -> str:
        """从第一行 '# 西红柿炒鸡蛋的做法' 中取出菜名"""
        first_line = text.splitlines()[0] if text else ""
        if first_line.startswith("# "):
            return first_line[2:].replace("的做法", "").strip()
        return os.path.splitext(filename)[0]

    def _parse_difficulty(self, text: str) -> int:
        """'预估烹饪难度：★★★' → 3，没写就返回 0"""
        match = re.search(r"预估烹饪难度：(★+)", text)
        return len(match.group(1)) if match else 0
