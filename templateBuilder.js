/*jshint esversion:6*/

function templateBuilder(body, template) {
  template = template.toString();
  template = template.replace(/{{elementName}}/gi, body.elementName);
  template = template.replace(/{{elementAtomicNumber}}/gi, body.elementAtomicNumber);
  template = template.replace(/{{elementSymbol}}/gi, body.elementSymbol);
  template = template.replace(/{{elementDescription}}/gi, body.elementDescription);
  return template;
}

module.exports = templateBuilder;