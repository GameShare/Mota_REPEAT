const config = {
            
    // 调试模式，在此模式下，会将每个格子的坐标显示出来，且勇者初始数据会初始化为所设置的参数
    DEBUG : false,

    DEBUG_Player : {
        // 此处填写调试模式下的勇者参数
        x      : 1,            // 勇者的x坐标
        y      : 6,            // 勇者的y坐标
        floor  : 2,            // 勇者的当前楼层
        lookAt : 4,            // 主角的面朝的方向，1左，2上，3右，4下
        HP     : 1000,         // 主角的生命值
        ATK    : 1000,           // 主角的攻击力
        DEF    : 10,           // 主角的防御力

        Keys   : {yellowDoor : 10, blueDoor : 10, redDoor : 10},
        Gold   : 0             // 主角的金币
    },


    activeSpeed: 300,       // 敌人和老人活动的速度
    doorSpeed : 50,         // 开关门的速度
    battleSpeed : 300       // 战斗中一次攻击的速度

}

window.onload = function() {

    let data = {enemyData, wallData, doorData, lavaData, itemsData, stairsData, NPCData, bigDealerData, swordData, shieldData}

    let player = new Player(config, data)
    let map = new Map(mapData)
    let ui = new UI(config, document, data)

    eventList.forEach(item => item.setRelatedClass(player, map, ui))
    NPCEventList.forEach(item => item.setRelatedClass(player, map, ui))

    player.setRelatedClass(map = map, ui = ui, eventList = eventList, NPCEventList = NPCEventList)
    map.setRelatedClass(player = player, ui = ui)
    ui.setRelatedClass(player = player, map = map)
    
    ui.creatTable()
    ui.drawFloor()
    ui.showData()

    // 键盘事件 设置
    document.onkeydown = function(event){
        let e = event || window.event || arguments.callee.caller.arguments[0];

        // 主角的移动事件, 主角是否允许移动交由 player 类进行判断
        if(e && e.keyCode == 37 || e && e.keyCode == 38 || e && e.keyCode == 39 || e && e.keyCode == 40){
            player.move(e.keyCode);
        }

        return false;
    }
}