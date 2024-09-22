const array = [
    { id: 3, name: 'Central Microscopy', fiscalYear: 2018 },
    { id: 5, name: 'Crystallography Facility', fiscalYear: 2018 },
    { id: 3, name: 'Central Microscopy', fiscalYear: 2017 },
    { id: 5, name: 'Crystallography Facility', fiscalYear: 2017 }
  ];
const result = [];
const map = new Map();
for (const item of array) {
    if(!map.has(item.id)){
        map.set(item.id, true);    // set any value to Map
        result.push(item);
    }
}
console.log('1',result)

function removeDuplicates(array, key) {
    let map = new Map();
    let result = [];
    for (let i = 0; i < array.length; i++) {
        if (!map.has(array[i][key])) {
            map.set(array[i][key], true);    // set any value to Map
            result.push(array[i]);
        }
    }
    return result;
}
console.log('2',removeDuplicates(array, 'id'))

Array.prototype.removeDuplicates = function (key) {
    let map = new Map();
    let result = [];
    for (let i = 0; i < this.length; i++) {
        if (!map.has(this[i][key])) {
            map.set(this[i][key], true);    // set any value to Map
            result.push(this[i]);
        }
    }
    return result;
}
console.log('3',array.removeDuplicates('id'))