const keysToRemove = ['src', 'area', 'order', 'child.0.title', 'child.1.title', 'child.2.title','id', 'render.requires','child.columnClass', 'render.strategy', 'label', 'child.amountToCreate', 'child.extendedItemName', 'options'];
// clean model as much as possible
export function loopOver(jsonData) {
  for (var prop in jsonData) {
    if (Object.prototype.hasOwnProperty.call(jsonData, prop)) {

      keysToRemove.forEach(key => {
        if (jsonData[prop][key]) delete jsonData[prop][key];
        if (jsonData[prop]['properties'][key]) delete jsonData[prop]['properties'][key];
      })
      loopOver(jsonData[prop]['children']);

    }
  }
  return jsonData;
}