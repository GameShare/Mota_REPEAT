// 魔塔事件类
class MotaEvent {

    /**
     * 魔塔游戏中所有事件的基类, 确定了事件模型的基本结构
     * 
     * @param {async Function} beforeTalkingEvent 在对话之前发生的事件, 比如说人物亮相之类的
     * @param {async Function} afterTalkingEvent 在对话之后发生的事件, 比如说勇者被打到只剩400滴血之类的
     * @param {Boolean} enable 事件是否有效, true 为有效, false 为无效, 无效的事件需要通过 enableEvent 方法来启用
     */
    constructor(beforeTalkingEvent, afterTalkingEvent, enable = true){
        this.beforeTalkingEvent = beforeTalkingEvent
        this.afterTalkingEvent = afterTalkingEvent

        // 事件在条件之下是否允许发生
        if (enable) {this.enable = true} else { this.enable = false }
    }

    setRelatedClass(player, map, ui) {
        this.player = player
        this.map = map
        this.ui = ui
    }

    async _beforeTalking(){
        await this.beforeTalkingEvent()
    }

    async _afterTalking(){
        await this.afterTalkingEvent()
    }

    async _talking() {
        // Defined by subclass.
    }

    // disbale 参数代表着在当前事件发生后, 是否将该事件禁用, 默认是禁用该事件
    async startEvent(disbale = true){
    
        // 事件发生过程中, 禁止勇者的移动
        this.player.moveFlag = false

        await this._beforeTalking()
        await this._talking()
        await this._afterTalking()

        this.ui.drawFloor();
        this.ui.showData();


        // 事件结束后, 勇者被允许移动
        this.player.moveFlag = true

        if(disbale) this.enable = false

        // 有些事件是连续发生的, 所以再一次检查是否发生事件
        this.player.playerCheckEvent()
    }

    async checkEvent(){
        // Defined bu subclass
        alert("该 checkEvent 函数不应该被直接调用")
    }

    // enable事件
    enableEvent(){
        this.enable = true
    }

    // disable事件
    disableEvent(){
        this.enable = false
    }
}

// 事件类型1:   勇者到达某个地方后, 发生各种事件
//              典型的事件为第3层与魔王发生的事件

class FixedCellMotaEvent extends MotaEvent {

    /**
     * 当勇者到达一个位置时, 会触发的事件
     * @param {async Function} beforeTalkingEvent 见 MotaEvent 类
     * @param {async Function} afterTalkingEvent  见 MotaEvent 类
     * @param {Array} talkingList 对话列表, 记载着与特定人物发生的一系列的对话
     * @param {MapCell} mapCell 发生事件的地图格子
     */
    constructor(beforeTalkingEvent, afterTalkingEvent, talkingList, mapCell) {
        super(beforeTalkingEvent, afterTalkingEvent, true)

        this.mapCell = mapCell
        this.talkingList = talkingList
    }

    async _talking(){
        if(this.talkingList.length === 0) return
        await this.ui.eventTalking(this.talkingList)
    }

    // 当勇者到达指定位置后, 开始发生事件
    async checkEvent(){
        if (!this.enable) return

        let currentCell = this.player.getPosition();
        
        if (currentCell.floor !== this.mapCell.floor ||
            currentCell.x     !== this.mapCell.x ||
            currentCell.y     !== this.mapCell.y)
            return


        this.startEvent()
    }
}

// 事件类型2:   勇者到达某个地方后, 发生各种事件
//              典型的事件为第8层击败两个初级守卫后大门打开的场景

class DefeatMonsterMotaEvent extends MotaEvent {
    /**
     * 当勇者击败一个或几个怪物时, 会触发的事件
     * @param {async Function} beforeTalkingEvent 见 MotaEvent 类
     * @param {async Function} afterTalkingEvent  见 MotaEvent 类
     * @param {Array} talkingList 对话列表, 记载着与特定人物发生的一系列的对话
     * @param {Array} monsterArr 需要击败的敌人的数组, 记载着每个敌人的位置
     */
    constructor(beforeTalkingEvent, afterTalkingEvent, talkingList, monsterArr) {
        super(beforeTalkingEvent, afterTalkingEvent, true)

        this.talkingList = talkingList
        this.monsterArr = monsterArr
    }

    async _talking(){
        if(this.talkingList.length === 0) return
        await this.ui.eventTalking(this.talkingList)
    }

    // 当勇者击败指定的怪物时, 开始发生事件
    async checkEvent(){
        if (!this.enable) return

        for(let i = 0; i < this.monsterArr.length; i++) {
            if(this.map.getMapData(this.monsterArr[i]).t === "enemy") return
        }

        this.startEvent()
    }
}

// 事件类型2:   勇者与某个NPC交谈时, 会发生的事件
//              典型的事件为第2层初次与小偷进行交谈的场景
//              需要注意的是, 此处的 NPC 并不是指商人, 商人会有选择而NPC不会有

class TalkWithNPCMotaEvent extends MotaEvent {

    /**
     * 当勇者与NPC交谈时, 会触发的事件
     * @param {async Function} beforeTalkingEvent 见 MotaEvent 类
     * @param {async Function} afterTalkingEvent  见 MotaEvent 类
     * @param {Array} talkingList 对话列表, 记载着与特定人物发生的一系列的对话
     */
    constructor(beforeTalkingEvent, afterTalkingEvent, talkingList, NPCPosition) {
        super(beforeTalkingEvent, afterTalkingEvent, true)

        this.talkingList = talkingList
        this.NPCPosition = NPCPosition
    }

    async _talking(){
        if(this.talkingList.length === 0) return
        await this.ui.eventTalking(this.talkingList)
    }

    // 该函数需要传入的是NPC所在的位置
    async checkEvent(NPCPosition){
        if (!this.enable) return

        if (NPCPosition.floor !== this.NPCPosition.floor ||
            NPCPosition.x     !== this.NPCPosition.x ||
            NPCPosition.y     !== this.NPCPosition.y)
            return

        this.startEvent()
    }

}









// 此处的 eventList 所登记的为 FixedCellMotaEvent 和 DefeatMonsterMotaEvent 事件
// *特别注意*   由于 this 的继承机制, 这里出现的函数应采用 function() {} 的形式
//              若采用 () => {} 会导致函数无法读取到类里的属性和方法
let eventList = [

    // 3F, 首次遭遇魔王
    new FixedCellMotaEvent(function() {
        // 此处应该出现魔王和此随从亮相的效果, 但由于相关函数还没有做完, 所以就先算了吧
    }, function() {
        this.player.setHP(400)
        this.player.setATK(10)
        this.player.setDEF(10)
        this.player.setPosition({floor : 2, x : 7, y : 2})
    }, [
        "魔王：我是魔王",
        "勇者：哦，你好魔王",
        "魔王：死ね！",
        "勇者：啊！！！！！"], {floor : 3, x : 8, y : 4}),


    // 2F, 在监狱里收到小偷的关怀
    new FixedCellMotaEvent(function() {}, function() {}, [
        "喂！",
        "喂！喂！",
        "喂！醒醒"], {floor : 2, x : 7, y : 2}),

    // 2F, 击败中级守卫后铁门打开的事件
    new DefeatMonsterMotaEvent(function() {}, async function() {
        await Promise.all([
            this.map.openDoorAndWall({floor : 2, x : 4, y : 4}),
            this.map.openDoorAndWall({floor : 2, x : 7, y : 4}),
            this.map.openDoorAndWall({floor : 2, x : 10, y : 4}),
            this.map.openDoorAndWall({floor : 2, x : 4, y : 8}),
            this.map.openDoorAndWall({floor : 2, x : 7, y : 8}),
            this.map.openDoorAndWall({floor : 2, x : 10, y : 8})
        ])
    },[], [
        {floor : 2, x : 1, y : 5}, {floor : 2, x : 1, y : 7}
    ]),
        
    // 8F, 击败初级守卫后绿门打开的事件
    new DefeatMonsterMotaEvent(function() {}, async function() {
        await this.map.openDoorAndWall({floor : 8, x : 3, y : 9})
    },[], [
        {floor : 8, x : 4, y : 8}, {floor : 8, x : 4, y : 10}
    ])
]


let NPCEventList = [

    // 2层, 被魔王打到地牢以后与小偷的对话
    new TalkWithNPCMotaEvent(function () {}, async function() {
        await this.map.openDoorAndWall({floor : 2, x : 6, y : 1})
        this.map.clearCell({floor : 2, x : 6, y : 2})
    },[
        "我是小偷だよ",
        "虽然你被关起来了, 但是没关系的だよ",
        "因为我给了开了一条路だよ",
        "我就先走了, 你一会儿也出来继续探险吧だよ"
    ],
    {floor : 2, x : 6, y : 2}),

    // 3层, 与老人的对话
    new TalkWithNPCMotaEvent(function () {}, async function() {
        // 此处应该是启用怪物手册
        this.map.clearCell({floor : 3, x : 3, y : 10})
    },[
        "孩子呦, 我是山中老人Assassin",
        "我行走江湖多年, 终于编写出了这本怪物手册",
        "今见你骨骼惊奇, 不如将此物赠送给你",
        "只不过....",
        "(怪物手册功能尚未实装)"
    ],
    {floor : 3, x : 3, y : 10}),
]