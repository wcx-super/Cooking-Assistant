"""
菜谱搜索智能助手演示程序
只演示基本的ask功能
"""
import time
from agent import RecipeAgent


def demo_basic_qa():
    """演示基本问答功能"""
    
    print("🚀 初始化菜谱搜索智能助手...")
    print("=" * 60)

    agent = RecipeAgent()
    
    print("\n📋 开始智能问答演示")
    print("=" * 60)
    
    # 演示问题
    demo_questions = [
        "西红柿炒鸡蛋怎么做？",
        "冰箱里有鸡蛋和番茄，能做什么？",
        "想做个简单的下饭菜，有什么推荐？",
        "你好",
        "怎么做佛跳墙？"
    ]
    
    for i, question in enumerate(demo_questions, 1):
        print(f"\n【问题 {i}】{question}")
        print("-" * 50)
        
        # 执行问答
        answer = agent.ask(question)
        
        # 暂停一下，便于观察
        if i < len(demo_questions):
            print("\n⏳ 2秒后继续下一个问题...")
            time.sleep(2)
    
    print("\n✅ 菜谱搜索智能助手演示完成！")


def interactive_mode():
    """交互模式"""
    print("\n" + "=" * 60)
    print("💬 菜谱搜索智能助手交互模式 (输入 'quit' 退出)")
    print("=" * 60)
    
    agent = RecipeAgent()
    print("✅ 菜谱智能助手已就绪，可以开始提问")
    
    while True:
        try:
            question = input("\n请输入问题: ").strip()
            
            if question.lower() in ['quit', 'exit', '退出', 'q']:
                print("👋 再见！")
                break
            
            if not question:
                continue
            
            print("🤔 正在思考...")
            answer = agent.ask(question)
            
        except KeyboardInterrupt:
            print("\n👋 用户中断，再见！")
            break
        except Exception as e:
            print(f"❌ 出错了: {e}")


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] in ['-i', '--interactive']:
        # 交互模式
        interactive_mode()
    else:
        # 演示模式
        demo_basic_qa()
