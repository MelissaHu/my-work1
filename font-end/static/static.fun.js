//随机生成id，图层-坐标拾取
export function GenNonDuplicateID(randomLength) {
    return Number(Math.random().toString().substr(3, randomLength) + Date.now()).toString(36)
}
export function diffArrById(arr1, arr2) {
    let result = [];
    for (let i = 0, len = arr1.length; i < len; i++) {
        let flag = false, tamp1 = arr1[i];
        for (let j = 0, jlen = arr2.length; j < jlen; j++) {
            let tamp2 = arr2[j];
            if (tamp1.id == tamp2.id) {
                flag = true;
                break;
            }
        }
        if (!flag) {
            result.push(tamp1);
        }
    }
    return result;
}