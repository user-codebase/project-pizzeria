import { select, templates  } from "../settings.js";
// import Flickity from "../../vendor/flickity.pkgd.min.js";

class Home{
  constructor(element){
    const thisHome = this;
    thisHome.render(element);
  }

  render(element){
    const thisHome = this;
    const generatedHTML = templates.homeWidget();

    thisHome.dom = {};
    thisHome.dom.wrapper = element;
    thisHome.dom.wrapper.innerHTML = generatedHTML;
    thisHome.dom.orderBox = thisHome.dom.wrapper.querySelector(select.home.orderBox);
    thisHome.dom.bookingBox = thisHome.dom.wrapper.querySelector(select.home.bookingBox);
  }
  getLinkBoxes(){
    const thisHome = this;
    return [thisHome.dom.orderBox, thisHome.dom.bookingBox];
  }
}

export default Home;