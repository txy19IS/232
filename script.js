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

    // 初始化人数变化监听
    const countInput = document.getElementById('undercover-player-count');
    if (countInput) {
        countInput.addEventListener('change', updateUndercoverInputFields);
    }

    loadMessages();
    loadMoments();
    
    // 每30秒自动刷新留言和趣事
    setInterval(loadMessages, 30000);
    setInterval(loadMoments, 30000);
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

    // 重置谁是卧底游戏状态
    if (document.getElementById('undercover-page')) {
        // 重置游戏状态变量
        undercoverPlayers = [];
        undercoverWords = {};
        undercoverRoles = {};
        currentUndercoverTurn = 0;
        undercoverEliminated = false;
        eliminatedPlayers = [];

        // 重置玩家人数为默认值6
        const playerCount = document.getElementById('undercover-player-count');
        if (playerCount) {
            playerCount.value = 6;
        }

        // 重置玩家名字输入框
        const namesContainer = document.getElementById('undercover-names-container');
        if (namesContainer) {
            namesContainer.innerHTML = '';
            for (let i = 1; i <= 6; i++) {
                const input = document.createElement('input');
                input.type = 'text';
                input.id = 'undercover-name-' + i;
                input.placeholder = '玩家' + i;
                input.maxLength = 10;
                namesContainer.appendChild(input);
            }
        }

        // 重置投票相关元素
        const voteArea = document.getElementById('undercover-vote-area');
        if (voteArea) {
            voteArea.style.display = 'none';
        }

        const voteButtons = document.getElementById('vote-buttons');
        if (voteButtons) {
            voteButtons.innerHTML = '';
        }

        const voteResult = document.getElementById('vote-result');
        if (voteResult) {
            voteResult.innerHTML = '';
        }

        // 隐藏游戏区域
        const gameArea = document.getElementById('undercover-game-area');
        if (gameArea) {
            gameArea.style.display = 'none';
        }

        // 重置词库选择为默认值
        const librarySelect = document.getElementById('undercover-library');
        if (librarySelect) {
            librarySelect.value = 'life';
        }

        // 隐藏自定义词语输入框
        const customWordsBox = document.getElementById('custom-words-box');
        if (customWordsBox) {
            customWordsBox.style.display = 'none';
        }

        // 清空自定义词语输入框
        const customNormal = document.getElementById('custom-word-normal');
        if (customNormal) {
            customNormal.value = '';
        }

        const customUndercover = document.getElementById('custom-word-undercover');
        if (customUndercover) {
            customUndercover.value = '';
        }
    }

    // 重置真心话大冒险状态
    if (document.getElementById('truth-page')) {
        resetTruthDare();
    }

    // 重置惩罚大转盘状态
    if (document.getElementById('roulette-page')) {
        resetRoulette();
    }
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
let undercoverEliminated = false;
let eliminatedPlayers = [];

// 词库数据
const wordLibraries = {
    life: [
        {normal: '手机', undercover: '平板'},
        {normal: '奶茶', undercover: '果汁'},
        {normal: '火锅', undercover: '烧烤'},
        {normal: '可乐', undercover: '雪碧'},
        {normal: '薯片', undercover: '锅巴'},
        {normal: '袜子', undercover: '手套'},
        {normal: '闹钟', undercover: '手表'},
        {normal: '耳机', undercover: '音箱'},
        {normal: '微信', undercover: 'QQ'},
        {normal: '外卖', undercover: '堂食'},
        {normal: '纸巾', undercover: '湿巾'},
        {normal: '梳子', undercover: '镜子'},
        {normal: '牙刷', undercover: '牙膏'},
        {normal: '毛巾', undercover: '浴巾'},
        {normal: '洗发水', undercover: '沐浴露'},
        {normal: '洗衣液', undercover: '洗洁精'},
        {normal: '拖鞋', undercover: '凉鞋'},
        {normal: '背包', undercover: '手提包'},
        {normal: '雨伞', undercover: '雨衣'},
        {normal: '风扇', undercover: '空调'},
        {normal: '冰箱', undercover: '冰柜'},
        {normal: '电视', undercover: '投影仪'},
        {normal: '相机', undercover: '手机'},
        {normal: '手表', undercover: '手环'},
        {normal: '眼镜', undercover: '隐形眼镜'}
    ],
    dorm: [
        {normal: '早八', undercover: '周末'},
        {normal: '课本', undercover: '小说'},
        {normal: '作业', undercover: '游戏'},
        {normal: '食堂', undercover: '外卖'},
        {normal: '宿舍', undercover: '教室'},
        {normal: '网课', undercover: '直播'},
        {normal: '考试', undercover: '复习'},
        {normal: '图书馆', undercover: '自习室'},
        {normal: '宿舍床帘', undercover: '蚊帐'},
        {normal: '充电宝', undercover: '电池'},
        {normal: '熬夜', undercover: '早睡'},
        {normal: '占座', undercover: '空座'},
        {normal: '澡堂', undercover: '厕所'},
        {normal: '查寝', undercover: '查房'},
        {normal: '熄灯', undercover: '断电'},
        {normal: '零食', undercover: '主食'},
        {normal: '泡面', undercover: '自热火锅'},
        {normal: '快递', undercover: '外卖'},
        {normal: '快递站', undercover: '菜鸟驿站'},
        {normal: '舍友', undercover: '同学'},
        {normal: '社团', undercover: '学生会'},
        {normal: '选修课', undercover: '必修课'},
        {normal: '体测', undercover: '体育课'},
        {normal: '军训', undercover: '军训服'},
        {normal: '校园卡', undercover: '银行卡'}
    ],
    network: [
        {normal: '摆烂', undercover: '躺平'},
        {normal: '社恐', undercover: '社牛'},
        {normal: '内卷', undercover: '躺平'},
        {normal: '显眼包', undercover: '普通人'},
        {normal: '干饭人', undercover: '吃货'},
        {normal: '熬夜冠军', undercover: '早睡达人'},
        {normal: '打工人', undercover: '学生党'},
        {normal: '追星', undercover: '追剧'},
        {normal: '表情包', undercover: '头像'},
        {normal: '弹幕', undercover: '评论'},
        {normal: '网红', undercover: '博主'},
        {normal: '打卡', undercover: '拍照'},
        {normal: '探店', undercover: '逛街'},
        {normal: '种草', undercover: '拔草'},
        {normal: '翻车', undercover: '成功'},
        {normal: '躺平', undercover: '佛系'},
        {normal: 'emo', undercover: '开心'},
        {normal: '破防', undercover: '无感'},
        {normal: '拿捏', undercover: '拿捏不住'},
        {normal: '掌控', undercover: '拿捏'},
        {normal: '下头', undercover: '上头'},
        {normal: '舔狗', undercover: '备胎'},
        {normal: '渣男', undercover: '暖男'},
        {normal: '绿茶', undercover: '白莲花'},
        {normal: '海王', undercover: '中央空调'}
    ],
    game: [
        {normal: '王者荣耀', undercover: '和平精英'},
        {normal: '抖音', undercover: '快手'},
        {normal: '微博', undercover: '小红书'},
        {normal: '周杰伦', undercover: '林俊杰'},
        {normal: '猫', undercover: '狗'},
        {normal: '洗澡', undercover: '洗头'},
        {normal: '刷牙', undercover: '洗脸'},
        {normal: '空调', undercover: '风扇'},
        {normal: '冬天', undercover: '夏天'},
        {normal: '奶茶店', undercover: '咖啡店'},
        {normal: '英雄联盟', undercover: '绝地求生'},
        {normal: '原神', undercover: '崩坏3'},
        {normal: '单机游戏', undercover: '网络游戏'},
        {normal: '手柄', undercover: '键盘'},
        {normal: '鼠标', undercover: '触控板'},
        {normal: '直播', undercover: '录播'},
        {normal: '主播', undercover: 'UP主'},
        {normal: '弹幕', undercover: '评论'},
        {normal: '打赏', undercover: '礼物'},
        {normal: '追剧', undercover: '看电影'},
        {normal: '电视剧', undercover: '综艺'},
        {normal: '电影', undercover: '动漫'},
        {normal: '小说', undercover: '漫画'},
        {normal: '听歌', undercover: '唱歌'},
        {normal: 'KTV', undercover: '酒吧'}
    ],
    advanced: [
        {normal: '苹果', undercover: '梨'},
        {normal: '西瓜', undercover: '哈密瓜'},
        {normal: '口红', undercover: '唇釉'},
        {normal: '粉底', undercover: '气垫'},
        {normal: '香水', undercover: '香薰'},
        {normal: '润唇膏', undercover: '口红'},
        {normal: '牛仔裤', undercover: '运动裤'},
        {normal: '卫衣', undercover: '毛衣'},
        {normal: '耳机', undercover: '耳麦'},
        {normal: '键盘', undercover: '鼠标'},
        {normal: '芒果', undercover: '榴莲'},
        {normal: '草莓', undercover: '蓝莓'},
        {normal: '葡萄', undercover: '提子'},
        {normal: '橙子', undercover: '橘子'},
        {normal: '香蕉', undercover: '芭蕉'},
        {normal: '黄瓜', undercover: '丝瓜'},
        {normal: '番茄', undercover: '圣女果'},
        {normal: '土豆', undercover: '红薯'},
        {normal: '洋葱', undercover: '大蒜'},
        {normal: '辣椒', undercover: '青椒'},
        {normal: '玫瑰', undercover: '月季'},
        {normal: '百合', undercover: '水仙'},
        {normal: '多肉', undercover: '仙人掌'},
        {normal: '绿萝', undercover: '吊兰'},
        {normal: '向日葵', undercover: '太阳花'},
        {normal: '钢琴', undercover: '电子琴'},
        {normal: '吉他', undercover: '尤克里里'},
        {normal: '小提琴', undercover: '大提琴'},
        {normal: '架子鼓', undercover: '手鼓'},
        {normal: '口琴', undercover: '笛子'}
    ],
    couple: [
        {normal: '男朋友', undercover: '男性朋友'},
        {normal: '女朋友', undercover: '女性朋友'},
        {normal: '约会', undercover: '聚餐'},
        {normal: '牵手', undercover: '挽手'},
        {normal: '拥抱', undercover: '搂抱'},
        {normal: '亲吻', undercover: '碰脸'},
        {normal: '情话', undercover: '土味情话'},
        {normal: '礼物', undercover: '惊喜'},
        {normal: '纪念日', undercover: '生日'},
        {normal: '异地恋', undercover: '同城恋'},
        {normal: '暗恋', undercover: '明恋'},
        {normal: '表白', undercover: '告白'},
        {normal: '吃醋', undercover: '嫉妒'},
        {normal: '冷战', undercover: '吵架'},
        {normal: '复合', undercover: '分手'},
        {normal: '网恋', undercover: '奔现'},
        {normal: '姐弟恋', undercover: '兄妹恋'},
        {normal: '大叔控', undercover: '小奶狗'},
        {normal: '御姐', undercover: '萝莉'},
        {normal: '直男', undercover: '渣男'}
    ],
    funny: [
        {normal: '抠脚大汉', undercover: '精致猪猪女孩'},
        {normal: '熬夜冠军', undercover: '早睡困难户'},
        {normal: '干饭人', undercover: '饭桶'},
        {normal: '躺平选手', undercover: '内卷达人'},
        {normal: '社恐天花板', undercover: '社牛天花板'},
        {normal: '路痴', undercover: '导航'},
        {normal: '方向感差', undercover: '路痴'},
        {normal: '手残党', undercover: '技术流'},
        {normal: '吃货', undercover: '饭渣'},
        {normal: '懒癌患者', undercover: '勤快人'},
        {normal: '拖延症', undercover: '急性子'},
        {normal: '选择困难症', undercover: '果断派'},
        {normal: '强迫症', undercover: '佛系'},
        {normal: '洁癖', undercover: '邋遢大王'},
        {normal: '熬夜党', undercover: '养生党'},
        {normal: '手机控', undercover: '电脑控'},
        {normal: '游戏宅', undercover: '现充'},
        {normal: '追星族', undercover: '路人'},
        {normal: '追剧狂魔', undercover: '弃剧达人'},
        {normal: '八卦达人', undercover: '吃瓜群众'}
    ],
    creative: [
        {normal: '白米饭', undercover: '白粥'},
        {normal: '馒头', undercover: '包子'},
        {normal: '油条', undercover: '麻花'},
        {normal: '豆浆', undercover: '牛奶'},
        {normal: '火锅底料', undercover: '老干妈'},
        {normal: '火锅', undercover: '麻辣烫'},
        {normal: '烧烤', undercover: '铁板烧'},
        {normal: '烤肉', undercover: '铁板烤肉'},
        {normal: '牛排', undercover: '猪排'},
        {normal: '寿司', undercover: '饭团'},
        {normal: '披萨', undercover: '馅饼'},
        {normal: '汉堡', undercover: '肉夹馍'},
        {normal: '薯条', undercover: '鸡米花'},
        {normal: '炸鸡', undercover: '炸串'},
        {normal: '奶茶', undercover: '奶盖茶'},
        {normal: '咖啡', undercover: '美式咖啡'},
        {normal: '可乐', undercover: '冰红茶'},
        {normal: '雪碧', undercover: '七喜'},
        {normal: '啤酒', undercover: '气泡水'},
        {normal: '红酒', undercover: '葡萄酒'},
        {normal: '高跟鞋', undercover: '运动鞋'},
        {normal: '裙子', undercover: '裤子'},
        {normal: '连衣裙', undercover: '裙子'},
        {normal: '短袖', undercover: '长袖'},
        {normal: '外套', undercover: '风衣'},
        {normal: '围巾', undercover: '围脖'},
        {normal: '帽子', undercover: '发箍'},
        {normal: '耳环', undercover: '耳钉'},
        {normal: '项链', undercover: '手链'},
        {normal: '戒指', undercover: '手环'}
    ]
};

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

    const library = document.getElementById('undercover-library').value;
    let wordPair = null;

    switch(library) {
        case 'life':
            wordPair = wordLibraries.life[Math.floor(Math.random() * wordLibraries.life.length)];
            break;
        case 'dorm':
            wordPair = wordLibraries.dorm[Math.floor(Math.random() * wordLibraries.dorm.length)];
            break;
        case 'network':
            wordPair = wordLibraries.network[Math.floor(Math.random() * wordLibraries.network.length)];
            break;
        case 'game':
            wordPair = wordLibraries.game[Math.floor(Math.random() * wordLibraries.game.length)];
            break;
        case 'advanced':
            wordPair = wordLibraries.advanced[Math.floor(Math.random() * wordLibraries.advanced.length)];
            break;
        case 'couple':
            wordPair = wordLibraries.couple[Math.floor(Math.random() * wordLibraries.couple.length)];
            break;
        case 'funny':
            wordPair = wordLibraries.funny[Math.floor(Math.random() * wordLibraries.funny.length)];
            break;
        case 'creative':
            wordPair = wordLibraries.creative[Math.floor(Math.random() * wordLibraries.creative.length)];
            break;
        case 'custom':
            const normalWord = document.getElementById('custom-word-normal').value.trim();
            const undercoverWord = document.getElementById('custom-word-undercover').value.trim();
            if (!normalWord || !undercoverWord) {
                alert('请输入自定义词语！');
                return;
            }
            undercoverWords.normal = normalWord;
            undercoverWords.undercover = undercoverWord;
            break;
        default:
            alert('请选择一个词库分类！');
            return;
    }

    if (wordPair) {
        undercoverWords.normal = wordPair.normal;
        undercoverWords.undercover = wordPair.undercover;
    }

    undercoverRoles = {};
    const undercoverIndex = Math.floor(Math.random() * undercoverPlayers.length);
    undercoverPlayers.forEach((player, index) => {
        undercoverRoles[player] = index === undercoverIndex ? 'undercover' : 'normal';
    });

    currentUndercoverTurn = 0;
    document.getElementById('undercover-game-area').style.display = 'block';
    document.getElementById('undercover-vote-area').style.display = 'none';
    document.getElementById('custom-words-box').style.display = 'none';

    showUndercoverTurn();
}

function showUndercoverTurn() {
    // 获取未被淘汰的玩家
    const remainingPlayers = undercoverPlayers.filter(p => !eliminatedPlayers.includes(p));
    
    if (remainingPlayers.length > 0) {
        // 确保当前回合索引在有效范围内
        currentUndercoverTurn = currentUndercoverTurn % remainingPlayers.length;
        const player = remainingPlayers[currentUndercoverTurn];
        document.getElementById('current-player').textContent = player;
        
        const role = undercoverRoles[player];
        const word = role === 'undercover' ? undercoverWords.undercover : undercoverWords.normal;
        document.getElementById('player-word').textContent = word;

        const wordCard = document.getElementById('word-card');
        wordCard.classList.remove('flipped');
        
        wordCard.onclick = function() {
            wordCard.classList.toggle('flipped');
        };
    }
}

function nextUndercoverTurn() {
    const remainingPlayers = undercoverPlayers.filter(p => !eliminatedPlayers.includes(p));
    
    if (remainingPlayers.length > 0) {
        currentUndercoverTurn++;
        if (currentUndercoverTurn >= remainingPlayers.length) {
            currentUndercoverTurn = 0;
        }
        showUndercoverTurn();
    }
}

function voteUndercover() {
    document.getElementById('undercover-game-area').style.display = 'none';
    document.getElementById('undercover-vote-area').style.display = 'block';

    const voteButtons = document.getElementById('vote-buttons');
    voteButtons.innerHTML = '';

    // 只显示未被淘汰的玩家
    const remainingPlayers = undercoverPlayers.filter(p => !eliminatedPlayers.includes(p));
    
    remainingPlayers.forEach(player => {
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
        undercoverEliminated = true;
        eliminatedPlayers.push(votedPlayer);
        result.innerHTML = '<h3 style="color: #FF69B4;">🎉 恭喜！找出了卧底！</h3><p>卧底是：' + votedPlayer + '</p>';
        result.innerHTML += '<button class="btn-primary" onclick="endUndercoverGame()">🏠 返回首页</button>';
    } else {
        eliminatedPlayers.push(votedPlayer);
        const remainingPlayers = undercoverPlayers.filter(p => !eliminatedPlayers.includes(p));
        const realUndercover = Object.keys(undercoverRoles).find(p => undercoverRoles[p] === 'undercover');

        if (remainingPlayers.length <= 2 && !undercoverEliminated) {
            result.innerHTML = '<h3 style="color: #FF6B6B;">😱 游戏结束！卧底获胜！</h3><p>卧底是：' + realUndercover + '</p>';
            result.innerHTML += '<button class="btn-primary" onclick="endUndercoverGame()">🏠 返回首页</button>';
        } else {
            result.innerHTML = '<h3 style="color: #FF6B6B;">😱 投错人了！</h3><p>真正的卧底隐藏中...</p>';
            result.innerHTML += '<button class="btn-secondary" onclick="continueUndercoverGame()">继续游戏 ▶</button>';
        }
    }
}

function continueUndercoverGame() {
    currentUndercoverTurn = 0;
    document.getElementById('undercover-vote-area').style.display = 'none';
    document.getElementById('undercover-game-area').style.display = 'block';
    showUndercoverTurn();
}

function endUndercoverGame() {
    // 重置游戏状态变量
    undercoverEliminated = false;
    eliminatedPlayers = [];
    
    // 调用 backToHome 函数完成所有重置
    backToHome();
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

    document.getElementById('result-display').innerHTML = '<p><strong>' + randomPlayer + '</strong></p><p>' + randomTask + '</p>';
}

function resetDraw() {
    document.getElementById('result-display').innerHTML = '';
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
let currentCategory = 'gentle';
let currentType = 'truth';
let usedQuestions = {}; // 记录已使用的题目

// 初始化已使用题目对象
function initUsedQuestions() {
    usedQuestions = {
        gentle: [],
        funny: [],
        exciting: [],
        easy: [],
        embarrassing: [],
        tricky: []
    };
}

// 初始化
initUsedQuestions();

// 题库数据
const truthDareQuestions = {
    // 温和真心话
    gentle: [
        '最近一次熬夜是因为什么',
        '手机里最多的表情包是什么类型',
        '最想改掉的一个坏习惯',
        '小时候做过最幼稚的一件事',
        '自己身上最不满意的小缺点',
        '从小到大最害怕的事物是什么',
        '最喜欢的季节以及理由',
        '日常最爱喝的饮品是什么',
        '每天雷打不动必做的小事',
        '最接受不了的食物有哪些',
        '放假更喜欢宅家还是出门游玩',
        '自己有什么别人不知道的小癖好',
        '平时缓解压力的方式是什么',
        '最近单曲循环的一首歌',
        '这辈子最幸运的一件小事',
        '一直想尝试却不敢做的事',
        '独处的时候会做什么打发时间',
        '最容易被什么小事瞬间治愈',
        '你是喜欢热闹还是安静的人',
        '朋友身上最吸引你的特质',
        '印象里最开心的一天',
        '有没有收藏舍不得删除的照片',
        '最喜欢什么口味的零食',
        '最讨厌的天气是什么',
        '有没有长期坚持的小习惯',
        '路上遇到熟人会主动打招呼吗',
        '觉得自己感性还是理性居多',
        '一天当中最摆烂的时间段',
        '别人什么行为会让你好感倍增',
        '你认为一段好友情最重要的是什么',
        '最向往的生活方式是什么',
        '有没有莫名很喜欢的小众事物',
        '你觉得自己成长最大的变化',
        '最想感谢身边的哪一个人',
        '难过的时候喜欢独处还是找人倾诉',
        '最喜欢的放松娱乐方式',
        '有没有特别喜欢的小动物',
        '你容易被别人的情绪影响吗',
        '最怀念哪一段时光',
        '花钱最舍得花在什么地方',
        '有没有强迫症或者小洁癖',
        '你觉得自己是慢热还是自来熟',
        '最讨厌别人的哪种小行为',
        '吃到好吃的会第一时间分享吗',
        '有没有偷偷羡慕过别人的生活',
        '你最常用的社交软件是什么',
        '下雨天你一般会做什么',
        '有没有一直想去却没去的地方',
        '做决定更相信直觉还是思考',
        '你觉得自己运气好还是一般'
    ],
    // 沙雕真心话
    funny: [
        '最长多久没有好好洗头',
        '有没有偷偷吃过别人的零食',
        '刷短视频最长连续多久',
        '网购踩过最离谱的雷是什么',
        '朋友圈文案都是随便乱编的吗',
        '有没有当面一套背后一套的时候',
        '睡觉会不会打呼、磨牙、说梦话',
        '上课或上班有没有偷偷吃东西',
        '见过最离谱的宿舍搞笑奇葩事',
        '为了偷懒不起床找过哪些借口',
        '手机相册里最多的内容是什么',
        '表面高冷私底下是不是很沙雕',
        '最懒得动手做的家务是什么',
        '有没有好奇偷偷看过别人手机',
        '生气的时候一般怎么自我消气',
        '有没有莫名其妙讨厌过某个人',
        '吃饭挑食严重吗，最讨厌啥菜',
        '熬夜的深夜一般都在干什么',
        '用过最羞耻、最社死的网名',
        '手机里存过哪些奇怪的截图',
        '走路会不会经常低头玩手机',
        '有没有假装听懂别人的尴尬对话',
        '饿到极致会做出什么离谱行为',
        '房间桌面最多能乱到什么程度',
        '有没有为了省钱委屈过自己',
        '看到镜子会不会习惯性自恋',
        '做错事第一反应是不是找借口',
        '有没有跟风做过很傻的事情',
        '藏零食最隐蔽的地方在哪里',
        '被人吐槽最多的一个小毛病',
        '洗澡最快几分钟搞定',
        '有没有上课偷偷打瞌睡被抓',
        '最不爱整理的东西是什么',
        '有没有奇怪的睡觉姿势',
        '朋友圈屏蔽过多少人',
        '嘴上喊减肥实际疯狂干饭',
        '有没有脑补各种离谱小故事',
        '最怕被室友翻到什么东西',
        '最不爱回复的消息类型',
        '出门必备的三样东西是什么',
        '有没有假装成熟其实很幼稚',
        '干过最敷衍的一件事',
        '刷到搞笑视频会憋笑吗',
        '有没有乱买没用的小东西',
        '最敷衍的社交行为是什么',
        '会不会偷偷模仿网红动作',
        '最怕别人突然查手机',
        '一天最少刷多久手机',
        '最尴尬的认错人经历',
        '有没有偷偷吐槽过室友'
    ],
    // 刺激真心话
    exciting: [
        '你做过最离谱的一件傻事是什么',
        '说一个你藏了很久的小秘密',
        '你撒过最大的谎是什么',
        '有没有背地里吐槽过身边的人',
        '你最受不了朋友什么坏习惯',
        '说一件你后悔很久的事情',
        '你最想删掉的黑历史是什么',
        '有没有骗过老师、家长或者同学',
        '你最讨厌网上哪种网红风气',
        '有没有偷偷嫉妒过身边的人',
        '你见过最虚伪的行为是什么',
        '说一个自己不敢让别人知道的弱点',
        '有没有故意敷衍过别人的消息',
        '你觉得自己最双标的地方在哪',
        '做过最自私的一件事是什么',
        '有没有假装生病偷懒逃课摸鱼',
        '你最怕被别人揭穿的一件事',
        '实话实说，你有没有看不起过人',
        '朋友圈哪些人是你刻意屏蔽的',
        '说一件你明明错了却死不承认的事',
        '你有没有故意冷暴力过别人',
        '网上冲浪做过最疯狂的事',
        '有没有偷看别人隐私的经历',
        '你觉得自己人品最大的缺点',
        '说一个你永远不会告诉家长的事',
        '有没有为了面子硬撑过什么事',
        '你最无法原谅的一件小事是什么',
        '有没有背后议论过好朋友',
        '你最摆烂、最颓废的一段日子',
        '有没有贪图小便宜占过别人好处',
        '你觉得成年人最现实的真相是什么',
        '有没有故意装高冷疏远过人',
        '说出你这辈子最社死的瞬间',
        '有没有偷偷弄坏别人东西隐瞒不说',
        '你最讨厌自己哪一种性格',
        '有没有为了合群做过不喜欢的事',
        '实话回答，你心机最重的时候',
        '有没有随手丢掉过别人的心意',
        '你觉得友情里最不能接受的背叛',
        '有没有因为懒惰耽误重要的事',
        '你见过最恶心的人际交往行为',
        '有没有嫉妒别人的颜值或者运气',
        '说一件你现在想起来都脸红的事',
        '有没有嘴上原谅心里记仇的时候',
        '你最想穿越回去改掉的一件事',
        '有没有跟风网暴或者跟风吐槽',
        '你隐藏最深的阴暗小想法',
        '有没有明明不喜欢还假装合群',
        '你觉得自己聪明还是很笨',
        '说一件你绝对不敢公开的小事'
    ],
    // 轻松大冒险
    easy: [
        '模仿小狗叫声持续十秒',
        '全程用夹子音说三句话',
        '真诚夸赞在场每一个人',
        '清唱一小段最近热门歌曲',
        '原地标准做十个深蹲',
        '用方言认真说一句我爱你',
        '背对大家比出可爱拍照姿势',
        '快速一口气说出十种水果',
        '模仿老师上课讲话的语气',
        '原地转圈五秒之后站稳不动',
        '大声给自己加油打气三遍',
        '模仿小猫走路绕房间走一圈',
        '认真念一句全网热门土味情话',
        '闭眼任由身边人摆布十秒钟',
        '连续比出五种不同爱心手势',
        '快速背诵一句经典古诗词',
        '假装采访身边一位好友提问',
        '做超丑鬼脸坚持保持五秒',
        '深呼吸大喊三声我超级快乐',
        '双手合十闭眼安静许愿十秒',
        '闭眼十秒再缓缓睁开眼睛',
        '用可爱语气完整自我介绍',
        '快速说出十五种不同零食',
        '模仿三种不同小动物的声音',
        '双手举高伸直坚持十五秒',
        '歪头微笑定格保持十秒钟',
        '原地轻轻小跳二十下',
        '模仿小朋友奶声奶气说话',
        '做出三种不同搞怪表情包表情',
        '慢慢摇摆身体放松晃动半分钟',
        '学青蛙跳五下',
        '用最慢语速念一句话',
        '给自己取一个可爱外号',
        '闭眼凭感觉画一个爱心',
        '模仿机器人说话一分钟',
        '双手叉腰傲娇说话三句',
        '快速倒数50数到1',
        '展示自己最可爱的表情',
        '学鸭子嘎嘎叫十秒',
        '温柔朗读一段短句',
        '原地伸展全身活动筋骨',
        '模仿老爷爷缓慢走路',
        '说出自己三个小优点',
        '单手插兜帅气摆姿势',
        '轻轻哼唱一首儿歌',
        '闭眼走三步不许摔倒',
        '做五个拉伸放松动作',
        '用开心的语气大喊口号',
        '模仿三种不同走路姿势',
        '安静深呼吸放松一分钟'
    ],
    // 社死大冒险
    embarrassing: [
        '大声朗读手机第一条备忘录内容',
        '模仿油腻男神或女神说话一分钟',
        '对着空气深情浪漫告白三十秒',
        '踮起脚尖小跑步绕房间完整一圈',
        '随机点开评论区大声念出内容',
        '假装激烈吵架一秒立刻和好',
        '用方言大喊三遍我超级可爱',
        '做夸张搞笑的全身拉伸动作',
        '模仿老奶奶走路和说话的样子',
        '给自己取一个超级土气的外号',
        '摇头晃脑随性念出任意一段话',
        '假装喝醉迷糊说话一分钟',
        '摆出三个超级搞笑的拍照姿势',
        '双手捂耳摇头晃脑坚持十秒',
        '模仿保安大叔巡逻走路姿势',
        '发一条搞笑文案朋友圈，5分钟后删除',
        '全程用最嗲的声音说十句话',
        '模仿大猩猩动作来回走动',
        '对着镜子自恋夸赞自己三分钟',
        '随机点开一首歌清唱高潮部分',
        '对着窗外大喊一句搞怪语录',
        '给微信随便一位好友发在干嘛',
        '用屁股在空中比划自己的名字',
        '含一口水忍住不笑坚持二十秒',
        '模仿网红热门舞蹈随便跳几句',
        '假装便秘用力表情保持十秒',
        '向墙壁深情对视亲吻十秒钟',
        '夸张表演一段生气又委屈的戏',
        '随便找路人表情包大声解读',
        '全程踮脚走路坚持三十秒',
        '用最油腻的语气夸在场一个人',
        '学土味摇摆舞十秒',
        '模仿客服说话口吻聊天',
        '大声念出自己的浏览器记录标题',
        '假装自己是网红直播一分钟',
        '扭腰摆胯做搞笑动作',
        '用古风语气说话五句',
        '原地表演一段假哭',
        '模仿外卖小哥打电话语气',
        '双手比耶歪头到处拍照姿势',
        '用新闻播报语气念一句话',
        '模仿丧尸走路绕一圈',
        '随便编一段离谱小故事',
        '捂住鼻子假装闻到臭味',
        '模仿傲娇公主说话方式',
        '做十个夸张扩胸运动',
        '用方言讲一句搞笑段子',
        '假装迷路自言自语一分钟',
        '摆出四个沙雕网红拍照姿势',
        '大喊自己是全场最显眼的人'
    ],
    // 整活大冒险
    tricky: [
        '用最夸张的演技表演暴怒30秒',
        '模仿十种不同动物叫声连续表演',
        '随机点开手机一张照片，给大家详细讲解',
        '用小学生写作文的语气吐槽一件事',
        '原地疯狂摇摆身体，自由发挥整活一分钟',
        '模仿各种奇葩走路姿势挨个走一遍',
        '说出自己五个致命缺点，实话实说',
        '全程歪头歪嘴说话，坚持一分钟',
        '给自己疯狂洗脑夸自己十分钟优点',
        '模仿反派角色气场，恐吓在场每个人',
        '闭眼让别人随便摆布造型，保持十秒',
        '用rap风格吐槽日常生活和宿舍趣事',
        '做全程鬼脸，坚持回答所有人提问',
        '模仿网红热门精神小伙全套动作',
        '大声说出自己所有的小毛病坏习惯',
        '假装中二病上身，自言自语演戏半分钟',
        '用最傻的姿势定格拍照保持五秒',
        '学老年人刷手机的样子完整模仿',
        '即兴编一个离谱恐怖小故事讲出来',
        '双手捏脸变形，做各种搞怪表情',
        '用吵架的语气认真念一段温柔文字',
        '模仿班主任训人，批评在场所有人',
        '随机选一个人，全程模仿对方动作一分钟',
        '闭气坚持尽可能久，不许提前换气',
        '用搞怪口音朗读一大段文字',
        '表演一秒切换喜怒哀乐四种表情',
        '把手机亮度调到最高，盯着看20秒',
        '假装失忆，回答所有人奇怪的提问',
        '夸张表演吃超级难吃食物的表情',
        '模仿游戏里反派台词，气场拉满',
        '原地蹦蹦跳跳边跳边喊搞笑口号',
        '用冷漠高冷脸说搞笑段子反差表演',
        '给自己起五个超级沙雕外号大声念出',
        '模仿喝醉发疯走路，绕房间一圈',
        '用严肃的语气讲一个超级搞笑的梗',
        '全身僵硬机器人模式行动一分钟',
        '模仿吃货看到美食的夸张反应',
        '双手捂脸，时不时偷看别人坚持半分钟',
        '即兴表演一段无厘头小品单人演绎',
        '用最快速度连贯说完一大段绕口令',
        '模仿不同年龄段说话：小孩、青年、老人',
        '故意做丑八怪造型，近距离展示所有人',
        '假装很有钱土豪语气说话一分钟',
        '原地不断深蹲同时大声唱歌不中断',
        '模仿生气摔东西的夸张假动作',
        '用emo伤感语调讲搞笑日常反差拉满',
        '全程踮脚+内八走路坚持一圈',
        '随机选三个表情包，现场肢体演绎出来',
        '表演社恐出门全程局促不安的样子',
        '放开自我随便整活，自由发挥一分钟'
    ]
};

function selectCategory(category) {
    currentCategory = category;
    document.querySelectorAll('.btn-difficulty').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.category === category);
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

    const questions = truthDareQuestions[currentCategory];
    
    // 过滤出未使用的题目
    const unusedQuestions = questions.filter((_, index) => !usedQuestions[currentCategory].includes(index));
    
    let randomContent;
    if (unusedQuestions.length > 0) {
        // 随机选择一个未使用的题目
        const randomIndex = Math.floor(Math.random() * unusedQuestions.length);
        const originalIndex = questions.indexOf(unusedQuestions[randomIndex]);
        randomContent = unusedQuestions[randomIndex];
        usedQuestions[currentCategory].push(originalIndex);
    } else {
        // 所有题目都用完了，重置并重新开始
        usedQuestions[currentCategory] = [];
        const randomIndex = Math.floor(Math.random() * questions.length);
        randomContent = questions[randomIndex];
        usedQuestions[currentCategory].push(randomIndex);
    }

    content.textContent = randomContent;
    card.classList.add('flipped');

    setTimeout(() => {
        card.classList.remove('flipped');
    }, 3000);
}

// 重置真心话大冒险状态
function resetTruthDare() {
    initUsedQuestions();
    currentCategory = 'gentle';
    currentType = 'truth';
    
    // 重置UI状态
    document.querySelectorAll('.btn-difficulty').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.category === 'gentle');
    });
    
    document.querySelectorAll('.btn-truth').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.type === 'truth');
    });
    
    document.getElementById('card-content').textContent = '点击抽取';
    document.getElementById('truth-card').classList.remove('flipped');
}

function flipCard() {
    const card = document.getElementById('truth-card');
    card.classList.toggle('flipped');
}

// ==================== 全局公共留言墙 ====================
// JSONBin配置 - 请替换为你自己的配置
const MESSAGE_BIN_ID = 'YOUR_MESSAGE_BIN_ID'; // 替换为你的JSONBin Bin ID
const MESSAGE_API_KEY = 'YOUR_MESSAGE_API_KEY'; // 替换为你的JSONBin API Key

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

    const newMessage = {
        nickname: nickname.substring(0, 10),
        content: content.substring(0, 30),
        time: new Date().toLocaleString('zh-CN'),
        id: Date.now().toString()
    };

    // 先获取现有留言
    fetch(`https://api.jsonbin.io/v3/b/${MESSAGE_BIN_ID}`, {
        headers: {
            'X-Master-Key': MESSAGE_API_KEY
        }
    })
        .then(response => response.json())
        .then(data => {
            let messages = [];
            if (data.record) {
                try {
                    messages = data.record;
                } catch (e) {
                    messages = [];
                }
            }

            messages.unshift(newMessage);

            if (messages.length > 100) {
                messages = messages.slice(0, 100);
            }

            return fetch(`https://api.jsonbin.io/v3/b/${MESSAGE_BIN_ID}`, {
                method: 'PUT',
                headers: {
                    'X-Master-Key': MESSAGE_API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(messages)
            });
        })
        .then(() => {
            document.getElementById('message-nickname').value = '';
            document.getElementById('message-content').value = '';
            loadMessages();
        })
        .catch(error => {
            console.error('提交留言失败:', error);
            alert('提交留言失败，请检查网络连接或配置');
        });
}

function loadMessages() {
    const container = document.getElementById('messages-container');
    if (!container) return;

    fetch(`https://api.jsonbin.io/v3/b/${MESSAGE_BIN_ID}`, {
        headers: {
            'X-Master-Key': MESSAGE_API_KEY
        }
    })
        .then(response => response.json())
        .then(data => {
            let messages = [];
            if (data.record) {
                try {
                    messages = data.record;
                } catch (e) {
                    messages = [];
                }
            }

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
        })
        .catch(error => {
            console.error('加载留言失败:', error);
            container.innerHTML = '<div class="no-message">加载留言失败，请检查网络连接</div>';
        });
}

// ==================== 趣事记录 ====================
// JSONBin配置 - 请替换为你自己的配置
const MOMENTS_BIN_ID = 'YOUR_MOMENTS_BIN_ID'; // 替换为你的JSONBin Bin ID
const MOMENTS_API_KEY = 'YOUR_MOMENTS_API_KEY'; // 替换为你的JSONBin API Key

let selectedImageBase64 = '';

function previewImage(input) {
    const previewArea = document.getElementById('preview-area');
    
    if (input.files && input.files[0]) {
        const file = input.files[0];
        
        if (file.size > 5 * 1024 * 1024) {
            alert('图片大小不能超过5MB！');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            selectedImageBase64 = e.target.result;
            previewArea.innerHTML = '<img src="' + e.target.result + '" style="max-width: 100%; max-height: 200px;">';
        };
        reader.readAsDataURL(file);
    }
}

function submitMoment() {
    const nickname = document.getElementById('moments-nickname').value.trim() || '匿名小可爱';
    const content = document.getElementById('moments-content').value.trim();

    if (!content) {
        alert('请输入趣事描述！');
        return;
    }

    if (content.length > 100) {
        alert('趣事描述不能超过100字！');
        return;
    }

    if (!selectedImageBase64) {
        alert('请选择一张图片！');
        return;
    }

    const newMoment = {
        nickname: nickname.substring(0, 10),
        content: content.substring(0, 100),
        image: selectedImageBase64,
        time: new Date().toLocaleString('zh-CN'),
        id: Date.now().toString()
    };

    // 先获取现有趣事
    fetch(`https://api.jsonbin.io/v3/b/${MOMENTS_BIN_ID}`, {
        headers: {
            'X-Master-Key': MOMENTS_API_KEY
        }
    })
        .then(response => response.json())
        .then(data => {
            let moments = [];
            if (data.record) {
                try {
                    moments = data.record;
                } catch (e) {
                    moments = [];
                }
            }

            moments.unshift(newMoment);

            if (moments.length > 50) {
                moments = moments.slice(0, 50);
            }

            return fetch(`https://api.jsonbin.io/v3/b/${MOMENTS_BIN_ID}`, {
                method: 'PUT',
                headers: {
                    'X-Master-Key': MOMENTS_API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(moments)
            });
        })
        .then(() => {
            document.getElementById('moments-nickname').value = '';
            document.getElementById('moments-content').value = '';
            document.getElementById('moments-image').value = '';
            document.getElementById('preview-area').innerHTML = '<span>点击选择图片</span>';
            selectedImageBase64 = '';
            loadMoments();
        })
        .catch(error => {
            console.error('发布趣事失败:', error);
            alert('发布趣事失败，请检查网络连接或配置');
        });
}

function loadMoments() {
    const container = document.getElementById('moments-container');
    if (!container) return;

    fetch(`https://api.jsonbin.io/v3/b/${MOMENTS_BIN_ID}`, {
        headers: {
            'X-Master-Key': MOMENTS_API_KEY
        }
    })
        .then(response => response.json())
        .then(data => {
            let moments = [];
            if (data.record) {
                try {
                    moments = data.record;
                } catch (e) {
                    moments = [];
                }
            }

            if (moments.length === 0) {
                container.innerHTML = '<div class="no-message">还没有趣事记录，快来分享吧~</div>';
                return;
            }

            container.innerHTML = moments.map(moment => `
                <div class="moment-card">
                    <div class="moment-header">
                        <span class="nickname">${moment.nickname}</span>
                        <span class="time">${moment.time}</span>
                    </div>
                    <div class="moment-image">
                        <img src="${moment.image}" alt="趣事图片">
                    </div>
                    <div class="moment-content">${moment.content}</div>
                </div>
            `).join('');
        })
        .catch(error => {
            console.error('加载趣事失败:', error);
            container.innerHTML = '<div class="no-message">加载趣事失败，请检查网络连接</div>';
        });
}