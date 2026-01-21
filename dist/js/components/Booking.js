import { select, templates } from "../settings.js";
import AmountWidget from "./AmountWidget.js";
import DatePicker from "./DatePicker.js";
import HourPicker from "./HourPicker.js";

class Booking{
    constructor(element){
        const thisBooking = this;
        thisBooking.render(element);
        thisBooking.initWidgets();
    }

    render(element) {
        const thisBooking = this;

        const generatedHTML = templates.bookingWidget();

        thisBooking.dom = {};
        thisBooking.dom.wrapper = element;
        thisBooking.dom.wrapper.innerHTML = generatedHTML;

        thisBooking.dom.peopleAmount = element.querySelector(select.booking.peopleAmount);
        thisBooking.dom.hoursAmount = element.querySelector(select.booking.hoursAmount);
        thisBooking.dom.datePicker = element.querySelector(select.widgets.datePicker.wrapper);
        thisBooking.dom.hourPicker = element.querySelector(select.widgets.hourPicker.wrapper);
    }

    initWidgets(){
        const thisBooking = this;
        
        new AmountWidget(thisBooking.dom.peopleAmount);
        new AmountWidget(thisBooking.dom.hoursAmount);
        new DatePicker(thisBooking.dom.datePicker);
        new HourPicker(thisBooking.dom.hourPicker);

        thisBooking.dom.peopleAmount.addEventListener('click', function(event){
            event.preventDefault();
            console.log(event);
        });

        thisBooking.dom.hoursAmount.addEventListener('click', function(event){
            event.preventDefault();
            console.log(event);
        });

        thisBooking.dom.datePicker.addEventListener('click', function(event){
            event.preventDefault();
            console.log(event);
        });

        thisBooking.dom.hourPicker.addEventListener('click', function(event){
            event.preventDefault();
            console.log(event);
        });
    }
}

export default Booking;