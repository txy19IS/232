document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', function() {
            const game = this.dataset.game;
            showGame(game);
        });
    });

    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            backToHome();
        });
    });

    loadMessages();
});

function showGame(game) {
    document.getElementById('main-page').style.display = 'none';
    document.querySelectorAll('.game-page').forEach(page => {
        page.style.display = 'none';
    });
    document.getElementById(game + '-page').style.display = 'block';

    if (game === 'roulette') {
        initRoulette();
    }
}

function backToHome() {
    document.getElementById('main-page').style.display = 'block';
    document.querySelectorAll('.game-page').forEach(page => {
        page.style.display = 'none';
    });
}

function toggleRules(element) {
    element.classList.toggle('active');
    const content = element.nextElementSibling;
    content.classList.toggle('show');
}

function saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function loadFromStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

// ==================== 谁是卧底 ====================
let undercoverPlayers = [];
let undercoverWords = {};
let undercoverRoles = {};
let currentUndercoverTurn = 0;

// 动态更新输入框数量
function updateUndercoverInputFields() {
    const count = parseInt(document.getElementById('undercover-player-count').value) || 6;
    const container = document.getElementById('undercover-names-container');
    container.innerHTML = '';
    
    for (let i = 1; i <= count; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.id = 'undercover-name-' + i;
        input.placeholder = '玩家' + i;
        input.maxLength = 10;
        container.appendChild(input);
    }
}

// 初始化人数变化监听
document.addEventListener('DOMContentLoaded', function() {
    const countInput = document.getElementById('undercover-player-count');
    if (countInput) {
        countInput.addEventListener('change', updateUndercoverInputFields);
    }

    // 移除词库选择事件监听，因为现在只有自定义词库
    // const librarySelect = document.getElementById('undercover-library');
    // if (librarySelect) {
    //     librarySelect.addEventListener('change', function() {
    //         const selected = this.value;
    //         document.getElementById('custom-words-box').style.display = selected === 'custom' ? 'block' : 'none';
    //     });
    // }
});

function startUndercover() {
    const count = parseInt(document.getElementById('undercover-player-count').value) || 6;
    undercoverPlayers = [];
    for (let i = 1; i <= count; i++) {
        const name = document.getElementById('undercover-name-' + i).value.trim();
        if (name) undercoverPlayers.push(name);
    }

    if (undercoverPlayers.length < 4) {
        alert('请至少输入4位玩家名字！');
        return;
    }

    // 只使用自定义词语
    const normalWord = document.getElementById('custom-word-normal').value.trim();
    const undercoverWord = document.getElementById('custom-word-undercover').value.trim();
    if (!normalWord || !undercoverWord) {
        alert('请输入自定义词语！');
        return;
    }
    undercoverWords.normal = normalWord;
    undercoverWords.undercover = undercoverWord;

    undercoverRoles = {};
    const undercoverIndex = Math.floor(Math.random() * undercoverPlayers.length);
    undercoverPlayers.forEach((player, index) => {
        undercoverRoles[player] = index === undercoverIndex ? 'undercover' : 'normal';
    });

    currentUndercoverTurn = 0;
    document.getElementById('undercover-game-area').style.display = 'block';
    document.getElementById('undercover-vote-area').style.display = 'none';
    
    // 隐藏自定义词语输入区域
    document.getElementById('custom-words-box').style.display = 'none';

    showUndercoverTurn();
}

function showUndercoverTurn() {
    const player = undercoverPlayers[currentUndercoverTurn];
    document.getElementById('current-player').textContent = player;
    
    // 根据玩家角色设置词汇
    const role = undercoverRoles[player];
    const word = role === 'undercover' ? undercoverWords.undercover : undercoverWords.normal;
    document.getElementById('player-word').textContent = word;

    const wordCard = document.getElementById('word-card');
    wordCard.classList.remove('flipped');
    
    // 为卡片添加点击事件，点击时翻转显示词汇
    wordCard.onclick = function() {
        wordCard.classList.toggle('flipped');
    };
}

function nextUndercoverTurn() {
    currentUndercoverTurn++;
    if (currentUndercoverTurn >= undercoverPlayers.length) {
        currentUndercoverTurn = 0;
    }
    showUndercoverTurn();
}

function voteUndercover() {
    document.getElementById('undercover-game-area').style.display = 'none';
    document.getElementById('undercover-vote-area').style.display = 'block';

    const voteButtons = document.getElementById('vote-buttons');
    voteButtons.innerHTML = '';

    undercoverPlayers.forEach(player => {
        const btn = document.createElement('button');
        btn.className = 'vote-btn';
        btn.textContent = player;
        btn.addEventListener('click', function() {
            document.querySelectorAll('.vote-btn').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            revealVoteResult(player);
        });
        voteButtons.appendChild(btn);
    });
}

function revealVoteResult(votedPlayer) {
    const result = document.getElementById('vote-result');
    const isUndercover = undercoverRoles[votedPlayer] === 'undercover';

    if (isUndercover) {
        result.innerHTML = '<h3 style="color: #FF69B4;">🎉 恭喜！找出了卧底！</h3><p>卧底是：' + votedPlayer + '</p>';
    } else {
        const realUndercover = Object.keys(undercoverRoles).find(p => undercoverRoles[p] === 'undercover');
        result.innerHTML = '<h3 style="color: #FF6B6B;">😱 投错人了！</h3><p>真正的卧底是：' + realUndercover + '</p>';
    }
}

// ==================== 简易狼人杀 ====================
let werewolfPlayers = [];
let werewolfRoles = {};
let werewolfAlive = [];
let werewolfPhase = 'night';
let werewolfKillTarget = null;
let witchHealUsed = false;
let witchPoisonUsed = false;
let witchSaveTarget = null;
let witchPoisonTarget = null;

function playSound(type) {
    const sounds = {
        night: 'https://assets.mixkit.co/sfx/preview/mixkit-spooky-horror-ambience-1467.mp3',
        werewolf: 'https://assets.mixkit.co/sfx/preview/mixkit-wolf-howling-1221.mp3',
        witch: 'https://assets.mixkit.co/sfx/preview/mixkit-mystical-whoosh-2872.mp3',
        day: 'https://assets.mixkit.co/sfx/preview/mixkit-morning-birds-13.mp3',
        vote: 'https://assets.mixkit.co/sfx/preview/mixkit-bell-notification-938.mp3',
        win: 'https://assets.mixkit.co/sfx/preview/mixkit-win-achievement-2018.mp3',
        lose: 'https://assets.mixkit.co/sfx/preview/mixkit-failure-arcade-alert-notification-240.mp3'
    };
    
    if (sounds[type]) {
        const audio = new Audio(sounds[type]);
        audio.volume = 0.3;
        audio.play().catch(e => console.log('音频播放失败:', e));
    }
}

function showStoryPrompt(message, type = 'info') {
    const gameLog = document.getElementById('game-log');
    const promptDiv = document.createElement('div');
    promptDiv.className = 'story-prompt';
    promptDiv.style.cssText = `
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 15px;
        border-radius: 10px;
        margin: 10px 0;
        text-align: center;
        font-size: 16px;
        font-weight: bold;
        animation: fadeIn 0.5s ease-in-out;
    `;
    promptDiv.innerHTML = message;
    gameLog.appendChild(promptDiv);
    gameLog.scrollTop = gameLog.scrollHeight;
    
    setTimeout(() => {
        promptDiv.style.animation = 'fadeOut 0.5s ease-in-out';
        setTimeout(() => promptDiv.remove(), 500);
    }, 3000);
}

function addGlobalStyles() {
    if (!document.getElementById('werewolf-styles')) {
        const style = document.createElement('style');
        style.id = 'werewolf-styles';
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            @keyframes fadeOut {
                from { opacity: 1; transform: translateY(0); }
                to { opacity: 0; transform: translateY(-20px); }
            }
            .story-prompt {
                z-index: 1000;
            }
        `;
        document.head.appendChild(style);
    }
}
addGlobalStyles();

function startWerewolf() {
    werewolfPlayers = [];
    for (let i = 1; i <= 6; i++) {
        const name = document.getElementById('werewolf-name-' + i).value.trim();
        if (name) werewolfPlayers.push(name);
    }

    if (werewolfPlayers.length !== 6) {
        alert('请输入6位玩家名字！');
        return;
    }

    const roleAssignment = ['wolf', 'wolf', 'villager', 'villager', 'villager', 'witch'];
    for (let i = roleAssignment.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [roleAssignment[i], roleAssignment[j]] = [roleAssignment[j], roleAssignment[i]];
    }

    werewolfRoles = {};
    werewolfAlive = [...werewolfPlayers];

    werewolfPlayers.forEach((player, index) => {
        werewolfRoles[player] = roleAssignment[index];
    });

    werewolfPhase = 'night';
    werewolfKillTarget = null;
    witchHealUsed = false;
    witchPoisonUsed = false;
    witchSaveTarget = null;
    witchPoisonTarget = null;

    document.getElementById('werewolf-game-area').style.display = 'block';
    document.getElementById('game-log').innerHTML = '<p style="text-align: center; color: #888;">游戏开始！正在分配角色...</p>';
    
    showStoryPrompt('🎉 狼人杀游戏开始！系统正在为每位玩家分配身份...', 'info');
    
    showRoleAssignment();
}

function showRoleAssignment() {
    document.getElementById('night-action').style.display = 'none';
    document.getElementById('day-result').style.display = 'none';
    document.getElementById('vote-section').style.display = 'none';

    let currentPlayerIndex = 0;
    
    function showNextPlayerRole() {
        if (currentPlayerIndex >= werewolfPlayers.length) {
            showStoryPrompt('🌙 身份分配完毕！现在开始第一夜...', 'info');
            setTimeout(startNight, 2000);
            return;
        }

        const player = werewolfPlayers[currentPlayerIndex];
        const role = werewolfRoles[player];
        
        let roleIcon = '';
        let roleName = '';
        
        switch (role) {
            case 'wolf':
                roleIcon = '🐺';
                roleName = '狼人';
                break;
            case 'villager':
                roleIcon = '👤';
                roleName = '村民';
                break;
            case 'witch':
                roleIcon = '🧙';
                roleName = '女巫';
                break;
        }

        document.getElementById('game-log').innerHTML = `
            <div style="text-align: center; margin: 20px 0;">
                <h3>${player} 的身份</h3>
                <div style="font-size: 64px; margin: 20px 0;">${roleIcon}</div>
                <h2 style="color: #FF69B4;">${roleName}</h2>
                <p style="color: #888; margin-top: 10px;">请记住你的身份，不要告诉别人！</p>
                <button class="btn-primary" onclick="hideRoleAndNext()" style="margin-top: 20px;">✅ 我已记住，隐藏身份</button>
            </div>
        `;
        
        currentPlayerIndex++;
    }

    function hideRoleAndNext() {
        document.getElementById('game-log').innerHTML = `
            <div style="text-align: center; margin: 20px 0;">
                <h3 style="color: #888;">🔒 身份已隐藏</h3>
                <div style="font-size: 48px; margin: 20px 0;">🔒</div>
                <p style="color: #888; margin-top: 10px;">请下一位玩家准备查看身份</p>
                <button class="btn-primary" onclick="nextPlayerRole()" style="margin-top: 20px;">下一位玩家查看 👉</button>
            </div>
        `;
    }

    window.nextPlayerRole = showNextPlayerRole;
    window.hideRoleAndNext = hideRoleAndNext;
    showNextPlayerRole();
}

function startNight() {
    werewolfPhase = 'night';
    document.querySelector('.phase.day').style.display = 'none';
    document.querySelector('.phase.night').style.display = 'inline-block';
    document.getElementById('night-action').style.display = 'block';
    document.getElementById('day-result').style.display = 'none';
    document.getElementById('vote-section').style.display = 'none';

    document.getElementById('night-prompt').textContent = '狼人请睁眼，选择要击杀的对象';

    const buttons = document.getElementById('action-buttons');
    buttons.innerHTML = '';

    werewolfAlive.forEach(player => {
        const btn = document.createElement('button');
        btn.className = 'action-btn';
        btn.textContent = player;
        btn.addEventListener('click', function() {
            document.querySelectorAll('.action-btn').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            werewolfKillTarget = player;
        });
        buttons.appendChild(btn);
    });

    addGameLog('🌙 夜晚来临，所有人闭眼...');
}

function confirmNightAction() {
    if (werewolfPhase === 'night' && werewolfKillTarget) {
        werewolfPhase = 'witch';
        document.getElementById('night-prompt').textContent = '女巫请睁眼，是否使用药剂？';

        const buttons = document.getElementById('action-buttons');
        buttons.innerHTML = '';

        if (!witchHealUsed) {
            const healBtn = document.createElement('button');
            healBtn.className = 'action-btn';
            healBtn.textContent = '💊 解药救 ' + werewolfKillTarget;
            healBtn.addEventListener('click', function() {
                witchSaveTarget = werewolfKillTarget;
                witchHealUsed = true;
                addGameLog('女巫使用了解药！');
                confirmWitchAction();
            });
            buttons.appendChild(healBtn);
        }

        if (!witchPoisonUsed) {
            const poisonBtn = document.createElement('button');
            poisonBtn.className = 'action-btn';
            poisonBtn.textContent = '☠️ 毒药';
            poisonBtn.addEventListener('click', function() {
                werewolfPhase = 'witch-poison';
                document.getElementById('night-prompt').textContent = '女巫选择要毒的人';

                const poisonButtons = document.getElementById('action-buttons');
                poisonButtons.innerHTML = '';

                werewolfAlive.forEach(player => {
                    if (player !== werewolfKillTarget) {
                        const btn = document.createElement('button');
                        btn.className = 'action-btn';
                        btn.textContent = player;
                        btn.addEventListener('click', function() {
                            witchPoisonTarget = player;
                            witchPoisonUsed = true;
                            addGameLog('女巫使用了毒药！');
                            confirmWitchAction();
                        });
                        poisonButtons.appendChild(btn);
                    }
                });
            });
            buttons.appendChild(poisonBtn);
        }

        const noBtn = document.createElement('button');
        noBtn.className = 'action-btn';
        noBtn.textContent = 'PASS 不用药';
        noBtn.addEventListener('click', confirmWitchAction);
        buttons.appendChild(noBtn);
    } else if (werewolfPhase === 'witch') {
        confirmWitchAction();
    } else if (werewolfPhase === 'witch-poison') {
        confirmWitchAction();
    }
}

function confirmWitchAction() {
    document.getElementById('night-action').style.display = 'none';
    document.getElementById('day-result').style.display = 'block';

    let deathMessage = '';
    const deathList = [];

    if (werewolfKillTarget && werewolfKillTarget !== witchSaveTarget) {
        deathList.push(werewolfKillTarget);
    }

    if (witchPoisonTarget && werewolfAlive.includes(witchPoisonTarget)) {
        deathList.push(witchPoisonTarget);
    }

    if (deathList.length === 0) {
        deathMessage = '昨晚是平安夜，没有人死亡。';
    } else {
        deathMessage = '昨晚死亡的人是：' + deathList.join('、');
        deathList.forEach(player => {
            const index = werewolfAlive.indexOf(player);
            if (index > -1) werewolfAlive.splice(index, 1);
        });
    }

    document.getElementById('death-info').textContent = deathMessage;
    addGameLog('☀️ 天亮了！' + deathMessage);
}

function nextPhase() {
    if (werewolfAlive.length <= 3) {
        checkWerewolfWin();
        return;
    }

    document.querySelector('.phase.day').style.display = 'inline-block';
    document.querySelector('.phase.night').style.display = 'none';
    document.getElementById('day-result').style.display = 'none';
    document.getElementById('vote-section').style.display = 'block';

    werewolfPhase = 'vote';

    const voteButtons = document.getElementById('werewolf-vote-buttons');
    voteButtons.innerHTML = '';

    werewolfAlive.forEach(player => {
        const btn = document.createElement('button');
        btn.className = 'vote-btn';
        btn.textContent = player;
        btn.addEventListener('click', function() {
            document.querySelectorAll('#werewolf-vote-buttons .vote-btn').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            processVote(player);
        });
        voteButtons.appendChild(btn);
    });

    const skipBtn = document.createElement('button');
    skipBtn.className = 'vote-btn skip-btn';
    skipBtn.textContent = '🤝 跳过投票（平票，无人出局）';
    skipBtn.style.background = '#888';
    skipBtn.addEventListener('click', function() {
        document.querySelectorAll('#werewolf-vote-buttons .vote-btn').forEach(b => b.classList.remove('selected'));
        this.classList.add('selected');
        processSkipVote();
    });
    voteButtons.appendChild(skipBtn);

    addGameLog('🗳️ 投票时间开始！');
}

function processSkipVote() {
    document.getElementById('vote-section').style.display = 'none';
    document.getElementById('day-result').style.display = 'block';

    showStoryPrompt('🤝 投票结束，无人出局，今晚继续！', 'info');
    
    document.getElementById('death-info').textContent = '🤝 投票结束，平票，无人出局！';
    addGameLog('🤝 投票平票，无人出局！');

    setTimeout(() => {
        showStoryPrompt('🌙 进入下一夜...', 'night');
        startNight();
    }, 2000);
}

function processVote(votedPlayer) {
    document.getElementById('vote-section').style.display = 'none';
    document.getElementById('day-result').style.display = 'block';

    const index = werewolfAlive.indexOf(votedPlayer);
    werewolfAlive.splice(index, 1);
    delete werewolfRoles[votedPlayer];

    document.getElementById('death-info').textContent = votedPlayer + ' 被投票出局！';
    addGameLog('🗳️ ' + votedPlayer + ' 被投票出局！');

    if (werewolfAlive.length <= 3) {
        setTimeout(checkWerewolfWin, 1500);
    } else {
        setTimeout(startNight, 1500);
    }
}

function checkWerewolfWin() {
    const aliveWolves = werewolfAlive.filter(p => werewolfRoles[p] === 'wolf');
    const aliveVillagers = werewolfAlive.filter(p => werewolfRoles[p] !== 'wolf');

    document.getElementById('day-result').style.display = 'none';
    document.getElementById('night-action').style.display = 'none';
    document.getElementById('vote-section').style.display = 'none';

    let resultHTML = '';
    let resultMessage = '';
    let isWolfWin = false;
    
    if (aliveWolves.length === 0) {
        resultMessage = '🎉 村民胜利！狼人全部出局！';
        playSound('win');
    } else if (aliveWolves.length >= aliveVillagers.length) {
        resultMessage = '🐺 狼人胜利！';
        playSound('lose');
        isWolfWin = true;
    }

    resultHTML = `
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 15px; margin: 20px 0; text-align: center; color: white;">
            <h2 style="font-size: 2rem; margin-bottom: 20px;">🏆 游戏结果 🏆</h2>
            <h3 style="font-size: 1.5rem; color: ${isWolfWin ? '#FF6B6B' : '#4ECDC4'};">${resultMessage}</h3>
        </div>
        <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="text-align: center; margin-bottom: 15px;">🎭 所有玩家身份</h3>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
    `;

    werewolfPlayers.forEach(player => {
        const role = werewolfRoles[player];
        const isAlive = werewolfAlive.includes(player);
        let roleIcon = '';
        let roleName = '';
        let roleColor = '';
        
        switch (role) {
            case 'wolf':
                roleIcon = '🐺';
                roleName = '狼人';
                roleColor = '#FF6B6B';
                break;
            case 'villager':
                roleIcon = '👤';
                roleName = '村民';
                roleColor = '#4ECDC4';
                break;
            case 'witch':
                roleIcon = '🧙';
                roleName = '女巫';
                roleColor = '#9D65C9';
                break;
        }

        resultHTML += `
            <div style="background: ${roleColor}; color: white; padding: 12px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                <span>${player} ${roleIcon} ${roleName}</span>
                <span style="font-size: 12px;">${isAlive ? '✅ 存活' : '💀 出局'}</span>
            </div>
        `;
    });

    resultHTML += `
            </div>
        </div>
        <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
            <h3>📊 游戏统计</h3>
            <p>存活狼人：<strong>${aliveWolves.length}</strong> 人</p>
            <p>存活村民：<strong>${aliveVillagers.length}</strong> 人</p>
            <p style="margin-top: 15px; font-size: 14px; color: #888;">感谢各位玩家参与！</p>
        </div>
        <button class="btn-primary" onclick="backToHome()" style="width: 100%; padding: 15px; font-size: 16px; margin-top: 10px;">🏠 返回首页重新开始</button>
    `;

    document.getElementById('game-log').innerHTML += resultHTML;
}

function addGameLog(message) {
    const log = document.getElementById('game-log');
    log.innerHTML += '<p>' + message + '</p>';
    log.scrollTop = log.scrollHeight;
}

// ==================== 宿舍抽签器 ====================
let drawPlayers = [];
let drawTasks = [];

function startDraw() {
    drawPlayers = [];
    for (let i = 1; i <= 6; i++) {
        const name = document.getElementById('draw-name-' + i).value.trim();
        if (name) drawPlayers.push(name);
    }

    const tasksText = document.getElementById('tasks-list').value.trim();
    if (!tasksText) {
        alert('请输入任务列表！');
        return;
    }
    drawTasks = tasksText.split('|').map(t => t.trim()).filter(t => t);

    if (drawTasks.length === 0) {
        alert('请输入有效的任务列表！');
        return;
    }

    document.getElementById('draw-result').style.display = 'block';

    const stick = document.getElementById('draw-stick');
    stick.style.animation = 'shake 0.3s ease-in-out infinite';

    setTimeout(() => {
        stick.style.animation = 'none';
        showDrawResult();
    }, 2000);
}

function showDrawResult() {
    const randomPlayer = drawPlayers[Math.floor(Math.random() * drawPlayers.length)];
    const randomTask = drawTasks[Math.floor(Math.random() * drawTasks.length)];

    document.getElementById('draw-result').innerHTML = `
        <div class="result-display">
            <h3>🎉 抽签结果</h3>
            <p><strong>${randomPlayer}</strong></p>
            <p>需要：${randomTask}</p>
        </div>
        <button class="btn-secondary" onclick="resetDraw()">🔄 再抽一次</button>
    `;
}

function resetDraw() {
    document.getElementById('draw-result').innerHTML = `
        <div class="draw-animation">
            <div class="draw-stick" id="draw-stick">🎲</div>
        </div>
        <button class="btn-secondary" onclick="resetDraw()">🔄 再抽一次</button>
    `;
    startDraw();
}

// ==================== 惩罚大转盘 ====================
let rouletteCanvas;
let rouletteCtx;
let rouletteColors = ['#FFB6C1', '#DDA0DD', '#87CEEB', '#98FB98', '#FFFACD', '#FFDAB9', '#E6E6FA', '#FF69B4'];
let punishments = [];
let isSpinning = false;

function initRoulette() {
    if (document.getElementById('roulette-canvas')) {
        const savedPunishments = loadFromStorage('punishments');
        if (savedPunishments && savedPunishments.length > 0) {
            punishments = savedPunishments;
            document.getElementById('punishments-list').value = punishments.join('|');
        } else {
            punishments = [
                '打扫宿舍一周', '请客喝奶茶', '唱首歌', '模仿动物叫',
                '做10个俯卧撑', '给家人打电话说爱你', '学狗叫', '原地转10圈'
            ];
        }
        drawRoulette();
    }
}

function drawRoulette() {
    rouletteCanvas = document.getElementById('roulette-canvas');
    if (!rouletteCanvas) return;

    rouletteCtx = rouletteCanvas.getContext('2d');
    const centerX = rouletteCanvas.width / 2;
    const centerY = rouletteCanvas.height / 2;
    const radius = 140;

    rouletteCtx.clearRect(0, 0, rouletteCanvas.width, rouletteCanvas.height);

    if (punishments.length === 0) {
        rouletteCtx.fillStyle = '#888';
        rouletteCtx.font = '16px Microsoft YaHei';
        rouletteCtx.textAlign = 'center';
        rouletteCtx.fillText('请添加惩罚内容', centerX, centerY);
        return;
    }

    const sliceAngle = (Math.PI * 2) / punishments.length;

    punishments.forEach((punishment, index) => {
        const startAngle = index * sliceAngle;
        const endAngle = (index + 1) * sliceAngle;

        rouletteCtx.beginPath();
        rouletteCtx.moveTo(centerX, centerY);
        rouletteCtx.arc(centerX, centerY, radius, startAngle, endAngle);
        rouletteCtx.closePath();
        rouletteCtx.fillStyle = rouletteColors[index % rouletteColors.length];
        rouletteCtx.fill();
        rouletteCtx.strokeStyle = '#fff';
        rouletteCtx.lineWidth = 2;
        rouletteCtx.stroke();

        rouletteCtx.save();
        rouletteCtx.translate(centerX, centerY);
        rouletteCtx.rotate(startAngle + sliceAngle / 2);
        rouletteCtx.textAlign = 'right';
        rouletteCtx.fillStyle = '#333';
        rouletteCtx.font = '12px Microsoft YaHei';

        const text = punishment.length > 6 ? punishment.substring(0, 5) + '..' : punishment;
        rouletteCtx.fillText(text, radius - 10, 0);
        rouletteCtx.restore();
    });

    rouletteCtx.beginPath();
    rouletteCtx.arc(centerX, centerY, 20, 0, Math.PI * 2);
    rouletteCtx.fillStyle = '#fff';
    rouletteCtx.fill();
    rouletteCtx.strokeStyle = '#333';
    rouletteCtx.lineWidth = 3;
    rouletteCtx.stroke();
}

function spinRoulette() {
    if (isSpinning) return;

    const punishmentsText = document.getElementById('punishments-list').value.trim();
    if (!punishmentsText) {
        alert('请输入惩罚内容！');
        return;
    }

    punishments = punishmentsText.split('|').map(p => p.trim()).filter(p => p);
    saveToStorage('punishments', punishments);
    drawRoulette();

    isSpinning = true;
    document.getElementById('spin-btn').disabled = true;

    let rotations = Math.random() * 5 + 5;
    let currentRotation = 0;
    const targetRotation = rotations * Math.PI * 2 + Math.random() * Math.PI * 2;
    const duration = 4000;
    const startTime = Date.now();

    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const easeOut = 1 - Math.pow(1 - progress, 3);
        currentRotation = targetRotation * easeOut;

        const canvas = document.getElementById('roulette-canvas');
        canvas.style.transform = `rotate(${currentRotation}rad)`;

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            isSpinning = false;
            document.getElementById('spin-btn').disabled = false;
            showRouletteResult();
        }
    }

    requestAnimationFrame(animate);
}

function showRouletteResult() {
    const canvas = document.getElementById('roulette-canvas');
    const rect = canvas.getBoundingClientRect();

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    let currentRotationNorm = parseFloat(canvas.style.transform.replace('rotate(', '').replace('rad)', '')) || 0;
    currentRotationNorm = currentRotationNorm % (Math.PI * 2);
    if (currentRotationNorm < 0) currentRotationNorm += Math.PI * 2;

    const pointerAngle = Math.PI / 2;
    const sliceAngle = (Math.PI * 2) / punishments.length;
    const index = Math.floor(((pointerAngle - currentRotationNorm + Math.PI * 2) % (Math.PI * 2)) / sliceAngle) % punishments.length;

    document.getElementById('roulette-result').style.display = 'block';
    document.getElementById('roulette-punishment').textContent = punishments[index];
}

function resetRoulette() {
    document.getElementById('roulette-result').style.display = 'none';
    document.getElementById('roulette-canvas').style.transform = 'rotate(0rad)';
}

// ==================== 真心话大冒险 ====================
let currentDifficulty = 'easy';
let currentType = 'truth';

const truthQuestions = {
    easy: [
        '你最喜欢宿舍里的哪一位室友？',
        '你在宿舍做过的最糗的事是什么？',
        '你第一次住宿舍时是什么感受？',
        '你最喜欢宿舍的哪个角落？',
        '你在宿舍最喜欢吃什么零食？',
        '你会在宿舍偷偷藏什么？',
        '你觉得宿舍最不可或缺的东西是什么？',
        '你最讨厌宿舍的什么规定？'
    ],
    normal: [
        '你有没有在宿舍里暗恋过谁？',
        '你偷用过室友的东西吗？',
        '你在宿舍说过谁的坏话？',
        '你有没有在宿舍里哭过？为什么？',
        '你最想和室友道歉的事是什么？',
        '你在宿舍做过最疯狂的事是什么？',
        '你有没有无意中看到过室友的秘密？',
        '你最不想让室友知道的事情是什么？'
    ],
    hard: [
        '如果可以，你想和哪位室友换床位？',
        '你觉得谁在宿舍里最不受欢迎？为什么？',
        '你有没有在宿舍里做过对不起室友的事？',
        '如果宿舍只能留一个人，你会选谁？',
        '你觉得谁最可能在宿舍里出轨？',
        '你最想和室友分享的秘密是什么？',
        '如果宿舍失火你会先救谁的东西？',
        '你觉得谁最有可能在宿舍里当叛徒？'
    ]
};

const dareTasks = {
    easy: [
        '模仿宿舍里的一个人',
        '用方言说一句我爱你',
        '给室友按摩1分钟',
        '模仿你最喜欢的卡通人物',
        '做5个夸张的表情',
        '用一首歌的调唱你的名字',
        '和室友说一句撒娇的话',
        '模仿一种动物走路'
    ],
    normal: [
        '给通讯录里的第一个人打电话说我想你了',
        '让室友在你的脸上画一个图案',
        '模仿宿舍里你最讨厌的人5分钟',
        '吃一口室友指定的东西',
        '对室友说一句土味情话',
        '让室友给你梳头1分钟',
        '学一种你讨厌的动物叫',
        '让室友在你的脸上贴贴纸'
    ],
    hard: [
        '给前任发一条我想你了',
        '给辅导员打电话说你逃课了',
        '在宿舍里当众跳一段舞',
        '让每位室友都在你脸上画一笔',
        '吃一口室友的剩饭',
        '给家人发消息说我想你们了',
        '在宿舍里大喊我是傻子',
        '让室友把你锁在衣柜里30秒'
    ]
};

function selectDifficulty(level) {
    currentDifficulty = level;
    document.querySelectorAll('.btn-difficulty').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.level === level);
    });
}

function selectType(type) {
    currentType = type;
    document.querySelectorAll('.btn-truth').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.type === type);
    });
}

function drawTruthCard() {
    const card = document.getElementById('truth-card');
    const content = document.getElementById('card-content');

    const questions = currentType === 'truth' ? truthQuestions[currentDifficulty] : dareTasks[currentDifficulty];
    const randomContent = questions[Math.floor(Math.random() * questions.length)];

    content.textContent = randomContent;
    card.classList.add('flipped');

    setTimeout(() => {
        card.classList.remove('flipped');
    }, 3000);
}

function flipCard() {
    const card = document.getElementById('truth-card');
    card.classList.toggle('flipped');
}

// ==================== 宿舍留言墙 ====================
function submitMessage() {
    const nickname = document.getElementById('message-nickname').value.trim() || '匿名小可爱';
    const content = document.getElementById('message-content').value.trim();

    if (!content) {
        alert('请输入留言内容！');
        return;
    }

    if (content.length > 30) {
        alert('留言内容不能超过30字！');
        return;
    }

    const messages = loadFromStorage('messages') || [];

    const message = {
        nickname: nickname.substring(0, 10),
        content: content.substring(0, 30),
        time: new Date().toLocaleString('zh-CN')
    };

    messages.unshift(message);
    saveToStorage('messages', messages);

    document.getElementById('message-nickname').value = '';
    document.getElementById('message-content').value = '';

    loadMessages();
}

function loadMessages() {
    const messages = loadFromStorage('messages') || [];
    const container = document.getElementById('messages-container');

    if (!container) return;

    if (messages.length === 0) {
        container.innerHTML = '<div class="no-message">还没有留言，快来抢沙发吧~</div>';
        return;
    }

    container.innerHTML = messages.map(msg => `
        <div class="message-card">
            <div class="nickname">${msg.nickname}</div>
            <div class="content">${msg.content}</div>
            <div class="time">${msg.time}</div>
        </div>
    `).join('');
}