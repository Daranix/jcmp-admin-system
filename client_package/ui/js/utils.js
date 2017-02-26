Array.prototype.GroupBy = function(groupKey) {

  var groups = [];
  var grouped = {};

  for(var i = 0; i < this.length; i++) {
    if(groups.indexOf(this[i][groupKey]) === -1) {
      groups.push(this[i][groupKey]);
    }
  }

  for(var i = 0; i < groups.length; i++) {

    grouped[groups[i]] = this.filter(function(e) {
      return e[groupKey] === groups[i];
    });

  }

  return grouped;

}

String.prototype.asTitle = function() {
  var title = this.replace("_"," ");
  title = title.charAt(0).toUpperCase() + title.slice(1);
  return title;
}
