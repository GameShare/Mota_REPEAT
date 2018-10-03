// 地图类
class Map {
    constructor(mapData) {
        this.mapData = mapData
    }

    // 设置相关联的类
    setRelatedClass(player, ui) {
        this.player = player;
        this.ui = ui;
    }

    /**
     * 查询地图数据
     * 
     * @param {Number} floor 所要查询的楼层
     * @param {Nunber} x 所要查询的x坐标
     * @param {Number} y 所要查询的y坐标
     * @returns {Object} {t: 要查询的格子的类型, f: 要查询的格子的具体内容}
     */
    getMapData({floor, x, y}) {
        return {t : this.mapData[floor][x][y].t, f : this.mapData[floor][x][y].f}
    }

    // 查询上下楼梯时勇者出现的位置
    // 返回一个 {downX, downY, upX, upY} 的数组
    getStairsData(floor){
        return this.mapData[floor][11]
    }

    /**
     * 将地图的某一部分进行更改
     * 
     * @param {Number} floor 所要设置的格子的楼层
     * @param {Number} x 所要设置的格子的x坐标
     * @param {Number} y 所要设置的格子的y坐标
     * @param {String} t 所要设置的格子的type
     * @param {String} f 所要设置的格子的feature
     */
    setMapData({floor, x, y}, t, f) {
        this.mapData[floor][x][y].t = t
        this.mapData[floor][x][y].f = f
    }

    // 清空地图上某一格子上的内容
    clearCell({floor, x, y}) {
        this.setMapData({floor, x, y}, 'none', 'none')
    }

    // 对地图上某一堵墙或某一扇门进行芝麻开门
    async openDoorAndWall({floor, x, y}) {

        // 禁止勇者移动
        this.player.moveFlag = false

        // 禁止在动画中的墙和门上进行例行绘制
        this.ui.exceptionCell = {x, y}

        // 先将格子从视觉上进行清空
        await this.ui.animationOfOpenDoorAndWall({floor, x, y})

        // 最后将对应的格子从数据上进行清空
        this.clearCell({floor, x, y})

        this.player.moveFlag = true
        this.ui.exceptionCell = {x : -1, y : -1}
    }

}