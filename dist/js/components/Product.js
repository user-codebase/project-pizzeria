import { templates, select, classNames } from "../settings.js";
import {utils} from "../utils.js";
import AmountWidget from "./AmountWidget.js";

class Product{
    constructor(id, data){
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();

      //test
      thisProduct.prepareCartProduct();
    }
    renderInMenu(){
      const thisProduct = this;

      /* generate HTML based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);

      /* create element using utils.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);

      /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);

      /* add element to menu */
      menuContainer.appendChild(thisProduct.element);
    }
    getElements(){
      const thisProduct = this;
      thisProduct.dom = {}
      thisProduct.dom.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.dom.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.dom.formInputs = thisProduct.dom.form.querySelectorAll(select.all.formInputs);
      thisProduct.dom.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.dom.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.dom.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.dom.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }

    initAccordion(){
      const thisProduct = this;
      
      /* find the clickable trigger*/
      const clickableTrigger = thisProduct.dom.accordionTrigger; //no more needed variable

      /* START: add event listener to clickable trigger*/
      clickableTrigger.addEventListener('click', function(event){

        /* prevent default action for event */
        event.preventDefault();
        /* find active product (product that has active class)*/
        const activeProduct = document.querySelector(select.all.menuProductsActive);
        
        /* if there is active product and it's not thisProduct*/
        if (activeProduct && activeProduct !== thisProduct.element) {
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
        }

        /* toggle active class on thisProduct.element */
        thisProduct.element.classList.toggle('active');
      });
    }

    initOrderForm(){
      const thisProduct = this;

      thisProduct.dom.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
      for(let input of thisProduct.dom.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }
      thisProduct.dom.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }

    processOrder(){
      const thisProduct = this;

      const formData = utils.serializeFormToObject(thisProduct.dom.form);

      // set price to default price
      let price = thisProduct.data.price;

      // for every category (param)...
      for (let paramId in thisProduct.data.params) {
        // determine param value
        const param = thisProduct.data.params[paramId];

        // for every option in this category
        for (let optionId in param.options) {
          // determine option value
          const option = param.options[optionId];

          // check if there is param with a name of paramId and option is selected
          if (formData[paramId] && formData[paramId].includes(optionId)) {
          
            // check if the option is not default
            if (!option.default) {
              // add option price to price variable
              price += option.price;
            }
          
          } else {
            // check if the option is default
            if (option.default) {
              // reduce price variable
              price -= option.price;
            }
          }

          // find image .paramId-optionId
          const selectorForImg = '.' + paramId + '-' + optionId
          const imgForProduct = thisProduct.dom.imageWrapper.querySelector(selectorForImg);

          if (imgForProduct){

            if (formData[paramId].includes(optionId)){
              imgForProduct.classList.add(classNames.menuProduct.imageVisible);
            }else{
              imgForProduct.classList.remove(classNames.menuProduct.imageVisible);
            }

          }


        }
      }


      // single price for one product
      thisProduct.priceSingle = price;

      // update calculated price in the HTML
      price *= thisProduct.amountWidget.value;

      thisProduct.dom.priceElem.innerHTML = price;
    }

    initAmountWidget(){
      const thisProduct = this;
      thisProduct.amountWidget = new AmountWidget(thisProduct.dom.amountWidgetElem);
      thisProduct.dom.amountWidgetElem.addEventListener('updated', function(){
        thisProduct.processOrder();
      })
    }

    addToCart(){
      const thisProduct = this;

      //   app.cart.add(thisProduct.prepareCartProduct());
      const event = new CustomEvent('add-to-cart', {
        bubbles: true,
        detail: {
            product: thisProduct.prepareCartProduct(),
        },
      });

      thisProduct.element.dispatchEvent(event);
    }

    prepareCartProduct(){
      const thisProduct = this;

      const productSummary = {};
      productSummary.id = thisProduct.id;
      productSummary.name = thisProduct.data.name;
      productSummary.amount = thisProduct.amountWidget.value;
      productSummary.priceSingle = thisProduct.priceSingle;
      productSummary.price = thisProduct.amountWidget.value * thisProduct.priceSingle;
      productSummary.params = thisProduct.prepareCartProductParams();

      thisProduct.prepareCartProductParams();
      return productSummary;
    }

    prepareCartProductParams(){
      const thisProduct = this;

      const summaryParams = {};

      const formData = utils.serializeFormToObject(thisProduct.dom.form);

      // for every category (param)...
      for (let paramId in thisProduct.data.params) {
        
        // determine param value
        const param = thisProduct.data.params[paramId];
        summaryParams[paramId] = {};
        summaryParams[paramId]['label'] = param['label'];
        summaryParams[paramId]['options'] = {};

        // for every option in this category
        for (let optionId in param.options) {

          // check if there is param with a name of paramId and option is selected
          if (formData[paramId] && formData[paramId].includes(optionId)) {
            summaryParams[paramId]['options'][optionId] = param.options[optionId]['label'];
          }

        }
      }

      return summaryParams;
    }

  }

  export default Product;