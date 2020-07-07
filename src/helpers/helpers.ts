const keysToRemove = ['src', 'area', 'order', 'child.0.title', 'child.1.title', 'child.2.title', 'child.3.title', 'child.4.title' ,'id', 'render.requires','child.columnClass', 'render.strategy', 'label', 'child.amountToCreate', 'child.extendedItemName', 'options'];
// clean model as much as possible
export function cleanModel(pages) {
  for (var prop in pages) {
    if (Object.prototype.hasOwnProperty.call(pages, prop)) {

      keysToRemove.forEach(key => {
        if (pages[prop][key]) delete pages[prop][key];
        if (pages[prop]['properties'][key]) delete pages[prop]['properties'][key];
      })
      cleanModel(pages[prop]['children']);

    }
  }
  return pages;
}