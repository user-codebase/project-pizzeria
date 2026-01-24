class BaseWidget{
  constructor(wrapperElement, initialValue){
    const thisWidget = this;
    thisWidget.dom = {};
    thisWidget.dom.wrapper = wrapperElement;    
    thisWidget.correctValue = initialValue;
  }

  get value(){
    const thisWidget = this;
    console.log('thisWidget.correctValue', thisWidget.correctValue);
    return thisWidget.correctValue;
  }

  set value(value){
    const thisWidget = this;  
    const newValue = thisWidget.parseValue(value);  
    /* TODO: Add validation */
    if (thisWidget.correctValue !== newValue && thisWidget.isValid(newValue)){
      thisWidget.correctValue = newValue;
      thisWidget.announce();
    }
    
    thisWidget.renderValue();
  }  

  setValue(value){
    const thisWidget = this;
    thisWidget.value = value;
  }

  parseValue(value){
    return parseInt(value);
  }  
  isValid(value){
    return !isNaN(value);
  }

  renderValue(){
    const thisWidget = this;
    thisWidget.dom.input.value = thisWidget.value;
  }

  announce(){
    const thisWidget = this;
    const event = new CustomEvent('updated', {
      bubbles: true
    });
    thisWidget.dom.wrapper.dispatchEvent(event);
  }
}

export default BaseWidget;