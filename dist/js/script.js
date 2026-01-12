/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

const select = {
  templateOf: {
    menuProduct: "#template-menu-product",
    cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
     // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
      },
    cartProduct: {
        amountWidget: '.widget-amount',
        price: '.cart__product-price',
        edit: '[href="#edit"]',
        remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 0,
      defaultMax: 10,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
  };

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
      // const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
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

      app.cart.add(thisProduct.prepareCartProduct());
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
      thisWidget.announce();
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
  class Cart{
    constructor(element){
      const thisCart = this;

      thisCart.products = [];

      thisCart.getElements(element);
      thisCart.initActions();
    }

    getElements(element){
      const thisCart = this;

      thisCart.dom = {};

      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
      thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
      thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
      thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
      thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
    }

    initActions(){
      const thisCart = this;
      thisCart.dom.toggleTrigger.addEventListener('click', function(){
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      })

      thisCart.dom.productList.addEventListener('updated', function(){
        thisCart.update();
      })

      thisCart.dom.productList.addEventListener('remove', function(event){
        thisCart.remove(event.detail.cartProduct);
      })

    }

    add(menuProduct){
      const thisCart = this;

      /* generate HTML based on template */
      const generatedHTML = templates.cartProduct(menuProduct);

      /* create element using utils.createElementFromHTML */
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);

      /* add element to menu */
      thisCart.dom.productList.appendChild(generatedDOM);

      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));

      
      //test
      // new CartProduct(menuProduct, generatedDOM);
      thisCart.update();
    }

    update(){
      const thisCart = this;

      const deliveryFee = settings.cart.defaultDeliveryFee;
      let totalNumber = 0;
      let subtotalPrice = 0;

      for (const cartProduct of thisCart.products){
        totalNumber += cartProduct.amount;
        subtotalPrice += cartProduct.price;
      }
      
      thisCart.totalPrice = subtotalPrice;

      thisCart.dom.totalNumber.innerHTML = totalNumber;
      thisCart.dom.subtotalPrice.innerHTML = thisCart.totalPrice
      thisCart.dom.deliveryFee.innerHTML = deliveryFee;
      thisCart.dom.totalPrice.innerHTML = thisCart.totalPrice;

      for (const totalPriceElem of thisCart.dom.totalPrice){
        totalPriceElem.innerHTML = thisCart.totalPrice + deliveryFee;
      }


    }

    remove(element){
      const thisCart = this;

      const indexOfElement = thisCart.products.indexOf(element);

      element.dom.wrapper.remove()

      console.log(indexOfElement);
      thisCart.products.splice(indexOfElement, 1);

      thisCart.update();

    }
  }

  class CartProduct{
    constructor(menuProduct, element){
      const thisCartProduct = this;

      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.price = menuProduct.price;
      // thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.params = menuProduct.params;
      

      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions();
    }

    getElements(element){
      const thisCartProduct = this;

      thisCartProduct.dom = {};
      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = element.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = element.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = element.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = element.querySelector(select.cartProduct.remove);
      thisCartProduct.dom.amount = element.querySelector(select.widgets.amount.input);

    }

     initAmountWidget(){
      const thisCartProduct = this;

      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);

      thisCartProduct.dom.amountWidget.addEventListener('updated', function(){
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;

        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      })

    }

    remove(){
      const thisCartProduct = this;

      const event = new CustomEvent('remove', {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        },
      })
      thisCartProduct.dom.wrapper.dispatchEvent(event);
    }

    initActions(){
      const thisCartProduct = this;

      thisCartProduct.dom.edit.addEventListener('click', function(event){
        event.preventDefault();
      })

      thisCartProduct.dom.remove.addEventListener('click', function(event){
        event.preventDefault();
        thisCartProduct.remove();
        // console.log('thisCartProduct.remove()', event);
      })


    }

  }




  const app = {
    initMenu: function(){
      const thisApp = this;
      
      for(const productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
      }
    },
    initData: function(){
      const thisApp = this;
      thisApp.data = dataSource;
    },
    init: function(){
      const thisApp = this;
      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart()
    },
    initCart: function(){
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    }
  };

  app.init();
}
