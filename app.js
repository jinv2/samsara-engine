const canvas = document.getElementById('art-canvas');
const ctx = canvas.getContext('2d');
const textDisplay = document.getElementById('poetic-text');
const btn = document.getElementById('generate-btn');
const input = document.getElementById('user-input');
const countDisplay = document.getElementById('count-display');

// 商业化相关 DOM
const modal = document.getElementById('pay-modal');
const verifyBtn = document.getElementById('verify-btn');
const codeInput = document.getElementById('activation-code');
const errorMsg = document.getElementById('error-msg');

// --- 商业逻辑: 检查剩余次数 ---
const MAX_FREE_TRIES = 3;
// 从本地存储获取状态
let isVip = localStorage.getItem('samsara_vip') === 'true';
let usageCount = parseInt(localStorage.getItem('samsara_count') || '0');

function updateButtonState() {
    if (isVip) {
        countDisplay.innerText = "∞"; // 无限
    } else {
        let left = MAX_FREE_TRIES - usageCount;
        if (left < 0) left = 0;
        countDisplay.innerText = left;
    }
}
updateButtonState(); // 初始化显示

// --- 激活按钮逻辑 ---
verifyBtn.addEventListener('click', () => {
    const code = codeInput.value.trim();
    if (code === '2026') {
        // 激活成功
        isVip = true;
        localStorage.setItem('samsara_vip', 'true');
        modal.classList.add('hidden');
        alert("激活成功！欢迎开启无限疗愈之旅。");
        updateButtonState();
    } else {
        errorMsg.innerText = "激活码错误，请检查或联系微信: Shensi-ST";
    }
});

// --- 生成按钮点击逻辑 (带拦截) ---
btn.addEventListener('click', () => {
    // 1. 检查权限
    if (!isVip && usageCount >= MAX_FREE_TRIES) {
        modal.classList.remove('hidden'); // 弹出付费框
        return;
    }

    // 2. 正常运行
    const prompt = input.value || "平静"; 
    textDisplay.innerText = "正在调频...";
    
    // 初始化音频
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    // 增加计数 (如果是免费用户)
    if (!isVip) {
        usageCount++;
        localStorage.setItem('samsara_count', usageCount);
        updateButtonState();
    }

    const dna = generateDNA(prompt);

    setTimeout(() => { 
        textDisplay.innerText = dna.response;
        stopSound();      
        playSound(dna);   
        initVisuals(dna); 
    }, 500);
});


// ==========================================
// 下面是之前的艺术生成逻辑 (保持不变)
// ==========================================

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

let audioCtx;
let oscillators = [];
let particles = [];
let animationId;

function stringToHash(string) {
    let hash = 0;
    if (string.length === 0) return hash;
    for (let i = 0; i < string.length; i++) {
        const char = string.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}

function generateDNA(text) {
    const hash = stringToHash(text);
    
    // 疗愈向的关键词匹配
    let mood = "unknown";
    if (/焦|痛|烦|累|哭|死|恐|sad|pain/.test(text)) mood = "healing"; // 转化痛苦
    else if (/爱|光|静|睡|美|calm|love/.test(text)) mood = "peace";   // 增强平静
    else if (/乱|吵|麻|忙|chaos/.test(text)) mood = "focus";          // 寻找秩序
    else if (/梦|幻|空|灵|void/.test(text)) mood = "dream";           // 精神探索

    let colors, baseFreq, waveType, speed;

    if (mood === "healing") {
        colors = ["#1a2a6c", "#b21f1f", "#fdbb2d"]; // 温暖渐变
        baseFreq = 174; // 174Hz 缓解疼痛与压力
        waveType = "sine";
        speed = 2;
    } else if (mood === "peace") {
        colors = ["#a8ff78", "#78ffd6", "#ffffff"]; // 治愈绿
        baseFreq = 528; // 528Hz 爱的频率
        waveType = "sine";
        speed = 1;
    } else if (mood === "focus") {
        colors = ["#2BC0E4", "#EAECC6", "#ffffff"]; // 冷静蓝
        baseFreq = 396; // 396Hz 释放恐惧
        waveType = "triangle";
        speed = 4;
    } else if (mood === "dream") {
        colors = ["#000000", "#434343", "#8A2387"]; // 深紫
        baseFreq = 963; // 963Hz 连接高维
        waveType = "sine";
        speed = 0.5;
    } else {
        const hue = hash % 360;
        colors = [`hsl(${hue}, 60%, 60%)`, `hsl(${(hue+30)%360}, 60%, 60%)`];
        baseFreq = 100 + (hash % 400);
        waveType = "sine";
        speed = 2;
    }

    return { mood, colors, speed, baseFreq, waveType, response: generatePoem(mood, text), hash };
}

function generatePoem(mood, input) {
    const templates = {
        healing: ["痛苦是成长的养料。", "深呼吸，释放那些重量。", "允许自己脆弱，然后变强。"],
        peace: ["此刻，你是安全的。", "宇宙的频率与你共振。", "感受光线穿过身体。"],
        focus: ["混乱中存在秩序。", "每一次心跳都是归位。", "专注当下的力量。"],
        dream: ["闭上眼，看见真实。", "我们在星尘中重逢。", "无限的可能性正在展开。"],
        unknown: ["已识别你的能量频率。", "正在为你调配专属声波。", "聆听内心的回响。"]
    };
    const list = templates[mood] || templates.unknown;
    return list[Math.floor(Math.random() * list.length)];
}

function initVisuals(dna) {
    particles = [];
    for(let i=0; i<80; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 4 + 1,
            speedX: (Math.random() - 0.5) * dna.speed,
            speedY: (Math.random() - 0.5) * dna.speed,
            color: dna.colors[Math.floor(Math.random() * dna.colors.length)]
        });
    }
    if(animationId) cancelAnimationFrame(animationId);
    animate(dna);
}

function animate(dna) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'; // 拖影更长，更梦幻
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
        
        // 连线更柔和
        particles.forEach(p2 => {
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if(dist < 100) {
                ctx.strokeStyle = p.color;
                ctx.globalAlpha = 0.2; // 线条更淡
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
                ctx.globalAlpha = 1.0;
            }
        });
    });
    animationId = requestAnimationFrame(() => animate(dna));
}

function playSound(dna) {
    const ratios = [1, 1.5]; 
    if (dna.hash % 2 === 0) ratios.push(1.25); 
    else ratios.push(1.2); 
    
    ratios.forEach(r => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = dna.waveType;
        osc.frequency.value = dna.baseFreq * r; 
        const now = audioCtx.currentTime;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 3); // 淡入更慢，适合疗愈
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        oscillators.push({osc, gain});
    });
}

function stopSound() {
    oscillators.forEach(o => {
        const now = audioCtx.currentTime;
        try {
            o.gain.gain.linearRampToValueAtTime(0, now + 2); // 淡出更慢
            o.osc.stop(now + 2);
        } catch(e) {}
    });
    oscillators = [];
}
