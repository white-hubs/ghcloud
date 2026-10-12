import { onMounted, onUnmounted } from 'vue';

// 用于存储模态框关闭函数的栈
export const closeStack: (() => void)[] = [];

export default function useEscClose(closeCallback: () => void) {
    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            if (closeStack.length > 0) {
                // 若有模态框显示，阻止默认退出全屏行为
                event.preventDefault(); 
                // 取出栈顶的关闭函数并执行
                const lastCloseCallback = closeStack.pop();
                lastCloseCallback?.();
            } else {
                // 若没有模态框显示，执行默认的退出全屏操作
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
            }
        }
    };

    onMounted(() => {
        // 模态框挂载时，将关闭函数添加到栈中
        closeStack.push(closeCallback);
        window.addEventListener('keydown', handleKeyDown);
    });

    onUnmounted(() => {
        // 模态框卸载时，从栈中移除对应的关闭函数
        const index = closeStack.indexOf(closeCallback);
        if (index!== -1) {
            closeStack.splice(index, 1);
        }
        window.removeEventListener('keydown', handleKeyDown);
    });
}