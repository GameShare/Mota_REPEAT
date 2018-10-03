// UI类
// 该类只管UI, 不管数据变化
class UI {
    constructor(config, document, data) {

        // 当前的UI类所相关联的美术资源
        this.data = data

        this.document = document;

        this.oGameTable = document.getElementById("gameTable");

        this.oYellowKey = document.getElementById("yellowKey");
        this.oBlueKey = document.getElementById("blueKey");
        this.oRedKey = document.getElementById("redKey");

        this.oPlLife = document.getElementById("plLife");
        this.oPlAttack = document.getElementById("plAttack");
        this.oPlGuard = document.getElementById("plGuard");
        this.oPlGold = document.getElementById("plGold");

        this.oEnName = document.getElementById("enName");
        this.oEnLife = document.getElementById("enLife");
        this.oEnAttack = document.getElementById("enAttack");
        this.oEnGuard = document.getElementById("enGuard");

        this.oMessage = document.getElementById("message");

        this.oSaying = document.getElementById("saying");
        this.oWords = document.getElementById("words");

        this.oBuying = document.getElementById("buying");
        this.oBuyingIntro = document.getElementById("buyingIntro");
        this.oBuyingMoney = document.getElementById("buyingMoney");

        this.oBuyLife = document.getElementById("buyLife");
        this.oBuyAttack = document.getElementById("buyAttack");
        this.oBuyGuard = document.getElementById("buyGuard");
        this.oBuyNone = document.getElementById("buyNone");

        this.oLifeNum = document.getElementById("lifeNum");
        this.oAttackNum = document.getElementById("attackNum");
        this.oGuardNum = document.getElementById("guardNum");

        this.oNoMoney = document.getElementById("noMoney");
        this.oBuyingNoMoney = document.getElementById("buyingNoMoney");
        this.oBuyingContinue = document.getElementById("buying-continue");

        // 当前怪物和老人的动作类型
        this.activeIndex = 0;

        // 开关门的速度
        this.doorSpeed = config.doorSpeed

        // 当前正在进行动作的格子, 应在重绘的时候予以排除
        this.exceptionCell = {x : -1, y : -1}

        setInterval(() => {
            this.activeIndex = this.activeIndex == 0 ? 1 : 0
            this.drawFloor();
        }, config.activeSpeed)
    }

    // 设置相关联的类
    setRelatedClass(player, map) {

        // 当前的UI类所相关联的角色
        this.player = player

        // 当前的UI类所相关联的地图数据
        this.map = map
    }

    // 刷新统计信息
    showData(){
        this.oYellowKey.innerHTML = this.player.getKey("yellowDoor")
        this.oBlueKey.innerHTML   = this.player.getKey("blueDoor")
        this.oRedKey.innerHTML    = this.player.getKey("redDoor")

        this.oPlLife.innerHTML    = this.player.getHP()
        this.oPlAttack.innerHTML  = this.player.getATK()
        this.oPlGuard.innerHTML   = this.player.getDEF()
        this.oPlGold.innerHTML    = this.player.getGold()
    }

    // 显示敌人的信息
    showEnemyData(enemy) {
        this.oEnName.innerHTML = enemy.getChsName()
        this.oEnLife.innerHTML = enemy.getHP()
        this.oEnAttack.innerHTML = enemy.getATK()
        this.oEnGuard.innerHTML = enemy.getDEF()
    }

    // 对战斗场景施加五毛特效
    async battleEffects({x, y, floor}, timeout = 200){

        this.exceptionCell = {x, y}

        let backup = this._backupImage(x, y)
        this._addBkImage(x, y, "images/Characters/Item01-10.png", -96, 0)
        await Util.timeout(timeout)
        this._restoreImage(x, y, backup)

        this.exceptionCell = {x : -1, y : -1}
    }

    // 显示调试信息
    showMessage(msg){
        let dateTime = new Date();
        this.oMessage.innerHTML = (dateTime.toLocaleString() + " " + msg + "<br>")
    }

    // 重绘当前楼层
    drawFloor(){

        // 绘制地图上 除主角以外 的基本信息
        for(let i = 0; i < 11; i++){
            for(let j = 0; j < 11; j++){

                // 排除正在进行绘制的格子
                if(this.exceptionCell.x === i && this.exceptionCell.y === j) break

                // 所要查询的格子的坐标
                let mapCell = {x : i, y : j, floor : this.player.getPosition().floor}

                switch(this.map.getMapData(mapCell).t){
                    case "none" : {
                        let newBk = "";
                        this._addBkImage(i,j,newBk,0,0);
                        break;
                    }
                    case "enemy": {
                        let newBk = "images/Characters/" +  this.data.enemyData[this.map.getMapData(mapCell).f].src;
                        let offY = this.data.enemyData[this.map.getMapData(mapCell).f].offsetY;
                        this._addBkImage(i,j,newBk,this.activeIndex * -32,offY);
                        break;
                    }
                    case "wall": {
                        let newBk = "images/Characters/" +  this.data.wallData[this.map.getMapData(mapCell).f].src;
                        let offX = this.data.wallData[this.map.getMapData(mapCell).f].offsetX;
                        this._addBkImage(i,j,newBk,offX,0);
                        break;
                    }
                    case "lava": {
                        let newBk = "images/Characters/" +  this.data.lavaData[this.map.getMapData(mapCell).f].src;
                        let offY = this.data.lavaData[this.map.getMapData(mapCell).f].offsetY;
                        this._addBkImage(i,j,newBk,this.activeIndex * -32,offY);
                        break;
                    }
                    case "door": {
                        let newBk = "images/Characters/" +  this.data.doorData[this.map.getMapData(mapCell).f].src;
                        let offX = this.data.doorData[this.map.getMapData(mapCell).f].offsetX;
                        this._addBkImage(i,j,newBk,offX,0);
                        break;
                    }
                    case "item":{
                        let newBk = "images/Characters/" +  this.data.itemsData[this.map.getMapData(mapCell).f].src;
                        let offX = this.data.itemsData[this.map.getMapData(mapCell).f].offsetX;
                        this._addBkImage(i,j,newBk,offX,0);
                        break;
                    }
                    case "stairs":{
                        let newBk = "images/" + this.data.stairsData[this.map.getMapData(mapCell).f].src;
                        this._addBkImage(i,j,newBk,0,0);
                        break;
                    }
                    case "NPC":{
                        let newBk = "images/Characters/" + this.data.NPCData[this.map.getMapData(mapCell).f].src;
                        let offY = this.data.NPCData[this.map.getMapData(mapCell).f].offsetY;
                        this._addBkImage(i,j,newBk,this.activeIndex * -64,offY);
                        break;
                    }
                    case "bigDealer":{
                        let newBk = "images/Characters/" +  this.data.bigDealerData[this.map.getMapData(mapCell).f].src;
                        let offX = this.data.bigDealerData[this.map.getMapData(mapCell).f].offsetX;
                        this._addBkImage(i,j,newBk,offX,0);
                        break;
                    }
                    case "sword":{
                        let newBk = "images/Characters/" +  this.data.swordData[this.map.getMapData(mapCell).f].src;
                        let offX = this.data.swordData[this.map.getMapData(mapCell).f].offsetX;
                        let offY = this.data.swordData[this.map.getMapData(mapCell).f].offsetY;
                        this._addBkImage(i,j,newBk,offX,offY);
                        break;
                    }
                    case "shield":{
                        let newBk = "images/Characters/" +  this.data.shieldData[this.map.getMapData(mapCell).f].src;
                        let offX = this.data.shieldData[this.map.getMapData(mapCell).f].offsetX;
                        let offY = this.data.shieldData[this.map.getMapData(mapCell).f].offsetY;
                        this._addBkImage(i,j,newBk,offX,offY);
                        break;
                    }
                }
            }
        }

        // 绘制主角
        let playerOffY;
        switch(this.player.getLookAt()){
            case 1: playerOffY = -33;break;
            case 2: playerOffY = -99;break;
            case 3: playerOffY = -66;break;
            case 4: playerOffY = 0;break;
        }
        let oToChange = this.document.getElementById(this.player.getPosition().x + '-' + this.player.getPosition().y);
        oToChange.style.background = "url('images/Characters/Actor01-Braver01.png') 0px "+ playerOffY + "px no-repeat," + oToChange.style.background;
    }

    // 对地图格子增加背景图片
    _addBkImage(i, j, bkImage, offX, offY) {
        let oToChange = this.document.getElementById(i+'-'+j);
        oToChange.style.background = "url('" + bkImage + "') " + offX + "px " + offY + "px no-repeat,url('images/Characters/Other09.png') 0px 0 no-repeat";
    }

    _backupImage(i, j) {
        let oToChange = this.document.getElementById(i+'-'+j);
        return oToChange.style.background
    }
    _restoreImage(i, j, backup){
        let oToChange = this.document.getElementById(i+'-'+j);
        oToChange.style.background = backup
    }

    // 创建魔塔游戏的场地
    creatTable(){
        let table = '<table><tbody>';
        for(let i = 0; i < 11; i++){
            table += '<tr>';
            for(let j = 0; j < 11; j++){
                if (config.DEBUG) { table += '<td id="' + i + '-' + j +'">'+i+'-'+j+'</td>' }
                else { table += '<td id="' + i + '-' + j +'"></td>' }
            }
            table += '</tr>';
        }
        table += '</tbody></table>';
        this.oGameTable.innerHTML += table;
    }

    // 芝麻开门、芝麻开墙 此函数 提供动画效果 和 动画结束后 将门或墙至零的效果
    async animationOfOpenDoorAndWall({floor, x, y}) {

        let oToChange = this.document.getElementById(x+'-'+y);
        let pre = oToChange.style.background.match(/^url.*?px/)
        let after = oToChange.style.background.match(/ url.*?repeat$/)

        await Util.timeout(this.doorSpeed)
        oToChange.style.background = pre[0] + " -32px no-repeat," + after[0];
        await Util.timeout(this.doorSpeed)
        oToChange.style.background = pre[0] + " -64px no-repeat," + after[0];
        await Util.timeout(this.doorSpeed)
        oToChange.style.background = pre[0] + " -96px no-repeat," + after[0];
        await Util.timeout(this.doorSpeed)
        oToChange.style.background = after[0];
    }

    // 发生事件时进行对话
    async eventTalking(talkingList){
        return new Promise((resolve) => {

            // 展示出对话框
            this.oSaying.style.visibility = "visible"

            // 当前正在进行的句子序号
            let wordsNum = -1

            // 因为要同时设置两个键盘事件，为使他们互不冲突，此处将对话的键盘事件设定在 window 上
            window.onkeydown = () => {
                wordsNum++;

                // 如果对话结束，则结束对话，并关闭对话框
                if(wordsNum == talkingList.length){
                    this.oSaying.style.visibility = "hidden";
                    window.onkeydown = null;
                    resolve();
                }
                // 如果对话没有结束，则显示接下来的对话
                else {
                    this.oWords.innerHTML = talkingList[wordsNum];
                }
            }
        })
    }
}