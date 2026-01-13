// director.js
exports.handler = async function(event, context) {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    const payload = JSON.parse(event.body);
    const text = payload.prompt || "";
    
    // --- 1. 情感分析逻辑 (根据你的经验定义) ---
    // 你可以无限扩展这里的词库
    let mood = "void"; // 默认：虚无
    if (/死|痛|黑|夜|伤|冷|dark|sad/.test(text)) mood = "chaos";
    if (/爱|光|暖|家|美|happy|love/.test(text)) mood = "harmony";
    if (/电|网|AI|数|梦|cyber/.test(text)) mood = "cyber";

    // --- 2. 参数生成 (DNA) ---
    // 这些数字将决定前端的画面和声音
    const dna = {
        mood: mood,
        // 视觉参数
        colors: mood === "chaos" ? ["#330000", "#000000", "#550000"] :
                mood === "harmony" ? ["#ffcc00", "#ff99cc", "#ffffff"] :
                mood === "cyber" ? ["#00ff00", "#000000", "#003300"] :
                ["#444444", "#000000", "#222222"], // void
        speed: mood === "chaos" ? 5 : (mood === "harmony" ? 1 : 10),
        
        // 听觉参数 (赫兹)
        baseFreq: mood === "chaos" ? 55 : (mood === "harmony" ? 261.63 : 110),
        waveType: mood === "harmony" ? "sine" : (mood === "chaos" ? "sawtooth" : "square"),
        
        // 文学参数 (服务端简单的拼贴)
        response: generatePoem(mood, text)
    };

    return {
        statusCode: 200,
        body: JSON.stringify(dna)
    };
};

// 极简的诗人逻辑
function generatePoem(mood, input) {
    const templates = {
        chaos: ["毁灭是新生的开始。", "在黑暗中，唯有意识长存。", `"${input}" 是深渊的回声。`],
        harmony: ["光线折射出灵魂的形状。", "温暖是宇宙的BUG。", `"${input}" 是一颗种子。`],
        cyber: ["代码即是血肉。", "记忆已被上传。", "现实是最大的全息投影。"],
        void: ["听到了... 虚无的震动。", "这里什么都没有，也什么都有。", `...${input}...`]
    };
    const list = templates[mood];
    return list[Math.floor(Math.random() * list.length)];
}
