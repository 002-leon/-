// DeepSeek API配置
const DEEPSEEK_API_KEY = 'sk-61d62661ccb34f26b29c5d081ee3909a';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// 创建AI聊天窗口的HTML结构
function createAIChatWidget() {
    const widgetHTML = `
        <div class="ai-chat-widget">
            <div class="ai-chat-button" id="aiChatButton">
                <i class="fas fa-robot"></i>
            </div>
            <div class="ai-chat-window" id="aiChatWindow">
                <div class="ai-chat-header" id="chatHeader">
                    <div class="drag-handle">
                        <i class="fas fa-grip-vertical"></i>
                        <span>AI中医助手</span>
                    </div>
                    <div class="close-button" id="closeChat">
                        <i class="fas fa-times"></i>
                    </div>
                </div>
                <div class="ai-chat-messages" id="chatMessages">
                    <div class="message ai-message">
                        您好！我是AI中医助手，请问有什么可以帮您？
                    </div>
                </div>
                <div class="typing-indicator" id="typingIndicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <div class="progress-container" id="progressContainer">
                    <div class="progress-bar" id="progressBar"></div>
                </div>
                <div class="ai-chat-input">
                    <input type="text" id="userInput" placeholder="请输入您的问题...">
                    <button id="sendMessage">发送</button>
                </div>
            </div>
        </div>
    `;
    
    // 将HTML结构添加到body中
    document.body.insertAdjacentHTML('beforeend', widgetHTML);
    
    // 初始化所有DOM元素
    initializeElements();
}

// 初始化所有DOM元素
function initializeElements() {
    // DOM元素
    window.chatButton = document.getElementById('aiChatButton');
    window.chatWindow = document.getElementById('aiChatWindow');
    window.chatHeader = document.getElementById('chatHeader');
    window.closeChat = document.getElementById('closeChat');
    window.chatMessages = document.getElementById('chatMessages');
    window.userInput = document.getElementById('userInput');
    window.sendButton = document.getElementById('sendMessage');
    window.typingIndicator = document.getElementById('typingIndicator');
    window.progressContainer = document.getElementById('progressContainer');
    window.progressBar = document.getElementById('progressBar');

    // 初始化事件监听
    initializeEventListeners();
}

// 初始化事件监听
function initializeEventListeners() {
    // 拖动相关变量
    let isDragging = false;
    let startX;
    let startY;
    let translateX = 0;
    let translateY = 0;
    let dragStartTime = 0;
    const CLICK_THRESHOLD = 200; // 点击判定阈值（毫秒）

    // 初始化位置
    function initPosition() {
        const savedPosition = localStorage.getItem('aiButtonPosition');
        if (savedPosition) {
            const position = JSON.parse(savedPosition);
            translateX = position.x;
            translateY = position.y;
            updatePosition();
        } else {
            // 默认位置（右下角）
            translateX = window.innerWidth - 80;
            translateY = window.innerHeight - 80;
            updatePosition();
        }
    }

    // 更新按钮位置
    function updatePosition() {
        chatButton.style.transform = `translate(${translateX}px, ${translateY}px)`;
    }

    // 拖动事件处理
    function dragStart(e) {
        isDragging = true;
        chatButton.classList.add('dragging');
        dragStartTime = Date.now();
        
        if (e.type === "touchstart") {
            startX = e.touches[0].clientX - translateX;
            startY = e.touches[0].clientY - translateY;
        } else {
            startX = e.clientX - translateX;
            startY = e.clientY - translateY;
        }
    }

    function dragEnd(e) {
        const dragDuration = Date.now() - dragStartTime;
        isDragging = false;
        chatButton.classList.remove('dragging');
        
        // 保存位置
        localStorage.setItem('aiButtonPosition', JSON.stringify({
            x: translateX,
            y: translateY
        }));

        // 如果是短时间的拖动（小于阈值），则视为点击
        if (dragDuration < CLICK_THRESHOLD) {
            handleClick(e);
        }
    }

    function drag(e) {
        if (!isDragging) return;
        
        e.preventDefault();
        
        let currentX, currentY;
        
        if (e.type === "touchmove") {
            currentX = e.touches[0].clientX - startX;
            currentY = e.touches[0].clientY - startY;
        } else {
            currentX = e.clientX - startX;
            currentY = e.clientY - startY;
        }
        
        // 限制在视口范围内
        const buttonRect = chatButton.getBoundingClientRect();
        const maxX = window.innerWidth - buttonRect.width;
        const maxY = window.innerHeight - buttonRect.height;
        
        translateX = Math.min(Math.max(0, currentX), maxX);
        translateY = Math.min(Math.max(0, currentY), maxY);
        
        updatePosition();
    }

    // 处理点击事件
    function handleClick(e) {
        if (isDragging) return;
        
        chatWindow.style.display = 'flex';
        
        // 计算聊天窗口的位置
        const buttonRect = chatButton.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // 默认显示在按钮上方
        let top = buttonRect.top - chatWindow.offsetHeight - 10;
        let left = buttonRect.left;
        
        // 如果按钮在屏幕上半部分，窗口显示在按钮下方
        if (buttonRect.top < windowHeight / 2) {
            top = buttonRect.bottom + 10;
        }
        
        // 如果按钮在屏幕右半部分，窗口显示在按钮左侧
        if (buttonRect.right > windowWidth / 2) {
            left = buttonRect.right - chatWindow.offsetWidth;
        }
        
        // 确保窗口不会超出屏幕
        top = Math.max(10, Math.min(top, windowHeight - chatWindow.offsetHeight - 10));
        left = Math.max(10, Math.min(left, windowWidth - chatWindow.offsetWidth - 10));
        
        chatWindow.style.top = `${top}px`;
        chatWindow.style.left = `${left}px`;
    }

    // 添加拖动事件监听
    chatButton.addEventListener("touchstart", dragStart, { passive: false });
    document.addEventListener("touchend", dragEnd);
    document.addEventListener("touchmove", drag, { passive: false });

    chatButton.addEventListener("mousedown", dragStart);
    document.addEventListener("mouseup", dragEnd);
    document.addEventListener("mousemove", drag);

    // 移除原有的点击事件监听，改为在dragEnd中处理
    // chatButton.addEventListener('click', handleClick);

    closeChat.addEventListener('click', () => {
        chatWindow.style.display = 'none';
    });

    // 发送消息事件监听
    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // 页面加载时初始化位置
    window.addEventListener('load', initPosition);

    // 窗口大小改变时重新计算位置
    window.addEventListener('resize', () => {
        const buttonRect = chatButton.getBoundingClientRect();
        const maxX = window.innerWidth - buttonRect.width;
        const maxY = window.innerHeight - buttonRect.height;
        
        translateX = Math.min(translateX, maxX);
        translateY = Math.min(translateY, maxY);
        
        updatePosition();
    });
}

// 格式化AI回复
function formatAIResponse(text) {
    // 移除markdown标记
    text = text.replace(/\*\*(.*?)\*\*/g, '$1') // 移除加粗
              .replace(/\*(.*?)\*/g, '$1')      // 移除斜体
              .replace(/`(.*?)`/g, '$1')        // 移除代码块
              .replace(/#{1,6}\s/g, '')         // 移除标题
              .replace(/\[(.*?)\]\((.*?)\)/g, '$1') // 移除链接
              .replace(/\n\n/g, '\n')           // 合并多余空行
              .trim();

    // 将文本分段
    const paragraphs = text.split('\n').filter(p => p.trim());
    return paragraphs.join('\n\n');
}

// 显示加载动画
function showLoading() {
    typingIndicator.style.display = 'block';
    progressContainer.style.display = 'block';
    progressBar.style.width = '0%';
    
    // 模拟进度条
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress > 90) {
            clearInterval(interval);
        }
        progressBar.style.width = `${Math.min(progress, 90)}%`;
    }, 200);
    
    return interval;
}

// 隐藏加载动画
function hideLoading(interval) {
    clearInterval(interval);
    typingIndicator.style.display = 'none';
    progressBar.style.width = '100%';
    setTimeout(() => {
        progressContainer.style.display = 'none';
        progressBar.style.width = '0%';
    }, 500);
}

// 发送消息
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    // 禁用输入
    userInput.disabled = true;
    sendButton.disabled = true;

    // 添加用户消息到聊天窗口
    addMessage(message, 'user');
    userInput.value = '';

    // 显示加载动画
    const loadingInterval = showLoading();

    try {
        // 调用DeepSeek API
        const response = await fetch(DEEPSEEK_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    {
                        role: 'system',
                        content: '你是一个专业的中医助手，请用专业且易懂的方式回答用户的问题。回答时请使用自然语言，不要使用markdown格式。'
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ],
                temperature: 0.7,
                max_tokens: 1000
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            let errorMessage = `请求失败 (状态码: ${response.status})`;
            
            if (errorData && errorData.error) {
                errorMessage += `\n错误详情: ${errorData.error.message || JSON.stringify(errorData.error)}`;
            }
            
            throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('API Response:', data);

        if (data.choices && data.choices[0] && data.choices[0].message) {
            const aiResponse = formatAIResponse(data.choices[0].message.content);
            addMessage(aiResponse, 'ai');
        } else {
            throw new Error('API返回数据格式不正确，请检查API配置');
        }
    } catch (error) {
        console.error('详细错误信息:', error);
        
        let errorMessage = '抱歉，我遇到了一些问题：\n';
        
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            errorMessage += '网络连接失败，请检查您的网络连接或API地址是否正确';
        } else if (error.message.includes('401')) {
            errorMessage += 'API密钥无效或已过期，请检查API密钥配置';
        } else if (error.message.includes('403')) {
            errorMessage += '没有访问权限，请检查API密钥权限';
        } else if (error.message.includes('404')) {
            errorMessage += 'API地址不存在，请检查API地址配置';
        } else if (error.message.includes('429')) {
            errorMessage += '请求过于频繁，请稍后再试';
        } else if (error.message.includes('500')) {
            errorMessage += '服务器内部错误，请稍后再试';
        } else {
            errorMessage += error.message;
        }
        
        addMessage(errorMessage, 'ai');
    } finally {
        // 隐藏加载动画
        hideLoading(loadingInterval);
        
        // 重新启用输入
        userInput.disabled = false;
        sendButton.disabled = false;
        userInput.focus();
    }
}

// 添加消息到聊天窗口
function addMessage(content, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    messageDiv.textContent = content;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 在页面加载完成后创建AI聊天窗口
document.addEventListener('DOMContentLoaded', createAIChatWidget); 