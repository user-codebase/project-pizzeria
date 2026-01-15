import {settings, select} from "../settings.js";

class AmountWidget{
    constructor(element){
      const thisWidget = this;

      thisWidget.getElements(element);

      const initialValue = parseInt(thisWidget.input.value);
  
       if (!isNaN(initialValue)){
        thisWidget.setValue(initialValue);
      } else {
        thisWidget.setValue(settings.amountWidget.defaultValue);
      }

      thisWidget.initActions();
    //   thisWidget.announce();
    }

    getElements(element){
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }
    setValue(value){
      const thisWidget = this;

      const newValue = parseInt(value);

      /* TODO: Add validation */
      if (thisWidget.value !== newValue && !isNaN(newValue)){
        if (newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax){
          thisWidget.value = newValue;
          thisWidget.announce();
        }
      }
      
      thisWidget.input.value = thisWidget.value;
    }
    initActions(){
      const thisWidget = this;
      
      thisWidget.input.addEventListener('change', function(){
        thisWidget.setValue(thisWidget.input.value);
      });

      thisWidget.linkDecrease.addEventListener('click', function(event){

        event.preventDefault();
        thisWidget.setValue(parseInt(thisWidget.input.value) - 1);
      })

      thisWidget.linkIncrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(parseInt(thisWidget.input.value) + 1);
      })
    }
    announce(){
      const thisWidget = this;

      // const event = new Event('updated');
      const event = new CustomEvent('updated', {
        bubbles: true
      });
      thisWidget.element.dispatchEvent(event);
    }
  }
  
  export default AmountWidget;