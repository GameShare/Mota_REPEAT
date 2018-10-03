// 勇者类
class Player {
    constructor(config, data) {

        // 调试模式下, 应用 config.DEBUG_Player 中的数据
        if (config.DEBUG) {
            // 应用调试数据
            this.x      = config.DEBUG_Player.x
            this.y      = config.DEBUG_Player.y     
            this.floor  = config.DEBUG_Player.floor 
            this.lookAt = config.DEBUG_Player.lookAt
            this.HP     = config.DEBUG_Player.HP    
            this.ATK    = config.DEBUG_Player.ATK   
            this.DEF    = config.DEBUG_Player.DEF   

            this.Keys   = config.DEBUG_Player.Keys
            this.Gold   = config.DEBUG_Player.Gold
        } else {
            // 这里面的数据都是游戏开始时的默认数据, 不要在这里进行修改
            // 要调试的话去 Config 里的调试数据中进行修改
            this.x      = 9             // 勇者的x坐标
            this.y      = 5             // 勇者的y坐标
            this.floor  = 1             // 勇者的当前楼层
            this.lookAt = 4             // 主角的面朝的方向，1左，2上，3右，4下
            this.HP     = 1000          // 主角的生命值
            this.ATK    = 100            // 主角的攻击力
            this.DEF    = 100            // 主角的防御力

            this.Keys   = {yellowDoor : 0, blueDoor : 0, redDoor : 0}
            this.Gold   = 0             // 主角的金币
        }

        this.config = config       
        
        // 当前是否允许移动, true 代表可以移动, false 代表不可移动
        this.moveFlag = true

        // 相关联的数据资源
        this.data = data
    }

    // 设置相关联的类
    setRelatedClass(map, ui, eventList, NPCEventList) {
        this.map = map
        this.ui = ui
        this.eventList = eventList
        this.NPCEventList = NPCEventList
    }

    
    /**
     * 将勇者设置到一个新的坐标上
     * 需要注意的是, 该函数并不会对画面进行重绘, 需要再次调用相关重绘函数以让位置变化显示在画面上
     *
     * @param {Number} x 主角的新坐标x
     * @param {Number} y 主角的新坐标y
     * @param {Number} floor 主角的新的所在楼层
     * @memberof Player
     */
    setPosition({x, y, floor}) {
        this.x = x
        this.y = y
        this.floor = floor
    }
    
    
    /**
     * 获取主角的位置
     *
     * @returns {Object} {x : x, y : y, floor : floor}
     * @memberof Player
     */
    getPosition(){
        return {
            x : this.x, 
            y : this.y, 
            floor : this.floor
        }
    }

    getLookAt(){return this.lookAt}
    setLookAt(lookAt){this.lookAt = lookAt}

    getHP() { return this.HP }
    setHP(HP) { this.HP = HP }
    offsetHP(d_HP) {this.HP += d_HP }

    getATK() { return this.ATK }
    setATK(ATK) { this.ATK = ATK }
    offsetATK(d_ATK) {this.ATK += d_ATK }

    getDEF() { return this.DEF }
    setDEF(DEF) { this.DEF = DEF }
    offsetDEF(d_DEF) {this.DEF += d_DEF }

    getGold() { return this.Gold }
    setGold(Gold) { this.Gold = Gold }
    offsetGold(d_Gold) {
        if (this.Gold + d_Gold < 0) return false
        this.Gold += d_Gold
        return true
    }

    // type 的类型只能是 "yellow" "blue" "red" 的其中一种
    getKey(type) { return this.Keys[type] }
    setKey(type, keys) { this.Keys[type] = keys }
    offsetKey(type, d_key) {
        if (this.Keys[type] + d_key < 0) return false
        this.Keys[type] += d_key
        return true
    }

    /**
     * 对敌人发动一次攻击, 需要对敌人是否被杀死的事件进行判断
     * 
     * @param {Enemy} enemy 正在进行攻击的敌人对象
     * @returns {Boolean} 敌人是否已死亡, 已死为 true, 未死为 false
     */
    _attacking(enemy){
        enemy.offsetHP(-(this.getATK() - enemy.getDEF()))
        let isDead = enemy.getHP() <= 0 ? true : false
        return isDead
    }

    /**
     * 让勇者进行一格的移动
     * 
     * @param {Number} keyCode 方向键的键盘码, 37代表左, 38代表上, 39代表右, 40代表下   
     * @param {Map} map 主角进行移动过程的地图 
     * @returns {Boolean} true 代表发生了变化; false 代表没有发生变化
     */
    async move(keyCode) {
        
        // 由当前类中的 moveFlag 来对是否允许移动进行判断
        if (!this.moveFlag) return false

        // 就算不能移动, 在已经通过 moveFlag 的情况下, 朝向还是可以改变的
        let checkPos = this.getPosition()
        switch (keyCode) {
            case 37:checkPos.y--; this.setLookAt(1); break;
            case 38:checkPos.x--; this.setLookAt(2); break;
            case 39:checkPos.y++; this.setLookAt(3); break;
            case 40:checkPos.x++; this.setLookAt(4); break;
        }

        // 如果通过移动检测, 则开始进行位置的移动
        if (await this._checkPosition(checkPos)) {
            this.setPosition(checkPos)
        }

        // 进行地图的重绘以显示出变化
        this.ui.showData()
        this.ui.drawFloor()

        // 检查是否发生事件
        this.playerCheckEvent();

        return true
    }

    // 检查当前的勇者所处的情况是否会触发事件
    playerCheckEvent(){
        this.eventList.forEach(item => item.checkEvent())
    }

    // 检查当前的勇者所处的情况是否会触发事件
    playerCheckNPCEvent(checkPos){
        this.NPCEventList.forEach(item => item.checkEvent(checkPos))
    }

    /**
     * 检查勇者是否能前进到指定的坐标, 并在检查过程中进行各种操作, 属于 *关键函数*
     * @param {Object} checkPos 要进行检查的坐标, 可能会在检查的过程中发生改变
     * @returns {Boolean} true 代表可以前进到指定坐标, false 代表不能前进到指定坐标
     */
    async _checkPosition (checkPos) {

        let map = this.map;
        let ui = this.ui;

        if (checkPos.x < 0 || checkPos.x > 10 || checkPos.y < 0 || checkPos.y > 10) return false
        switch(map.getMapData(checkPos).t) {

            // 空地 ---- 通过检测, 允许移动
            case "none" : return true

            // 墙面 ---- 普通墙禁止通行; 暗墙则先消去暗墙, 然后禁止通行
            case "wall" :
                switch(map.getMapData(checkPos).f){
                    case "normal": return false
                    case "darkNormal": map.openDoorAndWall(checkPos); return false
                }

            // 门 ---- 事件类型的墙禁止通行; 颜色墙则检查对应的钥匙的数量, 若数量满足则开门
            case "door" :
                switch(map.getMapData(checkPos).f) {
                    case "locked": return false
                    default: {
                        if (this.getKey(map.getMapData(checkPos).f) > 0) {
                            map.openDoorAndWall(checkPos)
                            this.offsetKey(map.getMapData(checkPos).f, -1)
                        }
                        return false
                    }
                }
            
            // 道具 ---- 对于不同的道具都需要单独地进行判断
            case "item" :
                
                // 道具加成, 每10层都会发生变化
                let time = parseInt(this.getPosition().floor / 10) + 1

                switch(map.getMapData(checkPos).f) {
                    case "yellowKey" : this.offsetKey("yellowDoor", 1); break;
                    case "blueKey"   : this.offsetKey("blueDoor", 1); break;
                    case "redKey"    : this.offsetKey("redDoor", 1); break;
                    case "redLife"   : this.offsetHP(50 * time); break;
                    case "blueLife"  : this.offsetHP(200 * time); break;
                    case "redGem"    : this.offsetATK(1 * time); break;
                    case "blueGem"   : this.offsetDEF(1 * time); break;
                }

                map.clearCell(checkPos)
                return true
            
            // 剑 ---- 根据数据加攻击力即可
            case "sword" :
                let swordATK = this.data.swordData[map.getMapData(checkPos).f].attack
                this.offsetATK(swordATK)

                map.clearCell(checkPos)
                return true

            // 盾 ---- 根据数据加防御力即可
            case "shield" :
                let shieldDEF = this.data.shieldData[map.getMapData(checkPos).f].guard
                this.offsetDEF(shieldDEF)

                map.clearCell(checkPos)
                return true

            // 楼梯 ---- 读取上一层或下一层的初始数据, 将勇者传送至指定位置即可
            case "stairs" :

                let currentFloor = this.getPosition().floor;

                switch(map.getMapData(checkPos).f) {
                    case "upStairs":
                        let downX = map.getStairsData(currentFloor + 1).downX
                        let downY = map.getStairsData(currentFloor + 1).downY
                        this.setPosition({x : downX, y : downY, floor : currentFloor + 1})
                        this.getLookAt(4)
                        
                        return false

                    case "downStairs":
                        let upX = map.getStairsData(currentFloor - 1).upX
                        let upY = map.getStairsData(currentFloor - 1).upY
                        this.setPosition({x : upX, y : upY, floor : currentFloor - 1})
                        this.getLookAt(4)
                        
                        return false
                }

            // 怪物
            case "enemy" :
                let enemyName = map.getMapData(checkPos).f
                let enemy = new Enemy(this.data.enemyData[enemyName])

                ui.showEnemyData(enemy)

                // 如果打不过, 则不再往前走
                let result = enemy.forecastResult(this)
                if (result === -1) {
                    ui.showMessage("你打不动他！")
                    return false
                }
                if (result === -2) {
                    ui.showMessage("你的生命值太低，打不过他！")
                    return false
                }

                // 如果能打过, 那就开打
                // *特别注意* 下面的这个 async 函数并没有使用 await 进行执行, 是为了实现勇者先移动后打架的效果
                this._fightWithEnemy(enemy, checkPos);
                return true
            
            case "NPC" :
                this.playerCheckNPCEvent(checkPos);
                return false

        }

    }

    // 勇者和怪物进行真枪实剑的对决
    // 由于在对决之前进行过结果预测, 所以一定是勇者的胜利!
    async _fightWithEnemy(enemy, position) {
        this.moveFlag = false
        await Util.timeout(0)
        while (true) {
            
            // 五毛特效
            await this.ui.battleEffects(position, 0.25 * this.config.battleSpeed)

            // 勇者的攻击, 如果把怪物杀死了, 就进行结算
            if (this._attacking(enemy)) break

            // 怪物的攻击
            enemy.attacking(this)

            this.ui.showData()
            this.ui.showEnemyData(enemy)

            await Util.timeout(0.75 * this.config.battleSpeed)
        }

        enemy.setHP(0)
        this.offsetGold(enemy.getGold())
        this.map.clearCell(position)
        this.ui.drawFloor()
        this.ui.showData()
        this.ui.showEnemyData(enemy)

        this.playerCheckEvent()

        this.moveFlag = true
    }
}