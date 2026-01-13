const canvas = document.getElementById('art-canvas');
const ctx = canvas.getContext('2d');
const textDisplay = document.getElementById('poetic-text');
const btn = document.getElementById('generate-btn');
const input = document.getElementById('user-input');

// 自适应屏幕
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// 音频上下文
let audioCtx;
let oscillators = [];

// 粒子系统
let particles = [];
let animationId;

// --- 核心交互 ---
btn.addEventListener('click', async () => {
    const prompt = input.value;
    textDisplay.innerText = "正在编译现实...";
    
    // 初始化音频 (必须在用户点击后触发)
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    // 呼叫后端指挥
    const res = await fetch('/.netlify/functions/director', {
        method: 'POST',
        body: JSON.stringify({ prompt: prompt })
    });
    const dna = await res.json();

    // 执行艺术
    textDisplay.innerText = dna.response;
    stopSound();      // 停止旧声音
    playSound(dna);   // 播放新声音
    initVisuals(dna); // 绘制新画面
});

// --- 视觉引擎 (HTML5 Canvas) ---
function initVisuals(dna) {
    particles = [];
    const count = 100;
    
    for(let i=0; i<count; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 3 + 1,
            speedX: (Math.random() - 0.5) * dna.speed,
            speedY: (Math.random() - 0.5) * dna.speed,
            color: dna.colors[Math.floor(Math.random() * dna.colors.length)]
        });
    }

    if(animationId) cancelAnimationFrame(animationId);
    animate();
}

function animate() {
    // 制造拖影效果 (让画面有流动感)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        p.x += p.speedX;
        p.y += p.speedY;

        // 边界反弹
        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
        
        // 连线效果 (增加科技感)
        particles.forEach(p2 => {
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if(dist < 100) {
                ctx.strokeStyle = p.color;
                ctx.lineWidth = 0.1;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        });
    });

    animationId = requestAnimationFrame(animate);
}

// --- 音频引擎 (Web Audio API) ---
function playSound(dna) {
    // 创建一个三和弦
    const ratios = [1, 1.5, 2]; // 根音, 五度, 八度
    
    ratios.forEach(r => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = dna.waveType;
        osc.frequency.value = dna.baseFreq * r; // 设置频率
        
        // 柔和的淡入淡出
        const now = audioCtx.currentTime;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.1, now + 2);
        
        // 增加混响/延迟效果 (简易版)
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start();
        oscillators.push({osc, gain});
    });
}

function stopSound() {
    oscillators.forEach(o => {
        const now = audioCtx.currentTime;
        o.gain.gain.linearRampToValueAtTime(0, now + 1); // 1秒淡出
        o.osc.stop(now + 1);
    });
    oscillators = [];
}
