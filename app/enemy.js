// Enemy类
class Enemy {
    constructor(enemyObj){
        this.chsName = enemyObj.chsName;
        this.HP      = enemyObj.HP;
        this.ATK     = enemyObj.ATK;
        this.DEF     = enemyObj.DEF;
        this.gold    = enemyObj.gold;
    }

    getChsName() { return this.chsName }
    getHP() { return this.HP }
    getATK() { return this.ATK }
    getDEF() { return this.DEF }
    getGold() { return this.gold }

    setHP(HP) { this.HP = HP }
    offsetHP(d_HP) {this.HP += d_HP }

    // 计算打死一个怪物需要多少生命值
    computeDamage(player){
        if(this.DEF >= player.getATK()) return Infinity

        // 进行战斗模拟，预估战斗结果
        let tempPlayerLifeDemage = 0
        let tempEnemyLife = this.getHP()
        while(true){
            tempEnemyLife -= player.getATK() - this.getDEF()
            if (tempEnemyLife <= 0) break
            tempPlayerLifeDemage += this.getATK() - player.getDEF() < 0 ? 0 : this.getATK() - player.getDEF()
        }

        return tempPlayerLifeDemage
    }

    // 估计勇者是否能打过怪物
    // 如果可以返回 true,  如果打不动则返回 -1,  如果生命值不够则返回 -2
    forecastResult(player) {

        // 如果勇者打不动怪物, 那就肯定打不过了
        if(this.DEF >= player.getATK()) return -1

        // 如果勇者打死怪物需要的生命值大于等于已有的生命值, 那也打不过
        if(this.computeDamage(player) >= player.getHP()) return -2

        return true
    }

    // 对勇者进行攻击的方法
    // 由于怪物把勇者杀死的事情并不会发生, 所以此处不会对勇者的HP低于0的事件进行判断
    attacking(player) {
        let demage = this.ATK - player.getDEF() > 0 ? this.ATK - player.getDEF() : 0
        player.offsetHP(-demage)
    }
}