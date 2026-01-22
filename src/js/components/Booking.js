import { classNames, select, settings, templates } from "../settings.js";
import { utils } from "../utils.js";
import AmountWidget from "./AmountWidget.js";
import DatePicker from "./DatePicker.js";
import HourPicker from "./HourPicker.js";

class Booking{
    constructor(element){
        const thisBooking = this;
        thisBooking.render(element);
        thisBooking.initWidgets();
        thisBooking.getData();
        thisBooking.selectTable();
        thisBooking.initActions();
    }

    getData(){
        const thisBooking = this;

        const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
        const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

        const params = {
          booking: [
            startDateParam,
            endDateParam,
          ],
          eventsCurrent: [
            settings.db.notRepeatParam,
            startDateParam,
            endDateParam,
          ],
          eventsRepeat: [
            settings.db.repeatParam,
            endDateParam,
          ],
        };

        // console.log('getData params', params);

        const urls = {
          booking:        settings.db.url + '/' + settings.db.bookings + '?' + params.booking.join('&'),
          eventsCurrent:  settings.db.url + '/' + settings.db.events + '?' + params.eventsCurrent.join('&'),
          eventsRepeat:   settings.db.url + '/' + settings.db.events + '?' + params.eventsRepeat.join('&'),
        };

        // console.log('getData urls', urls);
        // thisBooking.testMethodAddBookings();

        Promise.all([
          fetch(urls.booking),
          fetch(urls.eventsCurrent),
          fetch(urls.eventsRepeat),
        ])
          .then(function(allResponses){
            const bookingsResponse = allResponses[0];
            const eventsCurrentResponse = allResponses[1];
            const eventsRepeatResponse = allResponses[2];
            return Promise.all([
              bookingsResponse.json(),
              eventsCurrentResponse.json(),
              eventsRepeatResponse.json(),
            ]);
          })
          .then(function([bookings, eventsCurrent, eventsRepeat]){
            // console.log(bookings);
            // console.log(eventsCurrent);
            // console.log(eventsRepeat);
            thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
          });
    }

    testMethodAddBookings(){

        console.log(settings.db.url + '/' + settings.db.bookings);
        const url = settings.db.url + '/' + settings.db.bookings;

        const options = {
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(
            {
                "date": "2026-01-25",
                "hour": "16:00",
                "table": 1,
                "duration": 3,
                "ppl": 4,
                "starters": ["water"]
            }
            )
        };

        fetch(url, options);
    }


    parseData(bookings, eventsCurrent, eventsRepeat){
      const thisBooking = this;

      thisBooking.booked = {};

      for (const item of bookings){
        thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
      }

      for (const item of eventsCurrent){
        thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
      }

      const minDate = thisBooking.datePicker.minDate;
      const maxDate = thisBooking.datePicker.maxDate;

      for(let item of eventsRepeat){
        if(item.repeat == 'daily'){
          for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
            thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
          }
        }
      }

      thisBooking.updateDOM();
    }

    makeBooked(date, hour, duration, table){
      const thisBooking = this;

      if(typeof thisBooking.booked[date] == 'undefined'){
        thisBooking.booked[date] = {};
      }

      const startHour = utils.hourToNumber(hour);

      for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
        if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
          thisBooking.booked[date][hourBlock] = [];
        }
        thisBooking.booked[date][hourBlock].push(table);
      }
    }

    updateDOM(){
      const thisBooking = this;

      thisBooking.date = thisBooking.datePicker.value;
      thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

      let allAvailable = false;

      if(
        typeof thisBooking.booked[thisBooking.date] == 'undefined'
        ||
        typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
      ){
        allAvailable = true;
      }

      for(let table of thisBooking.dom.tables){
        let tableId = table.getAttribute(settings.booking.tableIdAttribute);
        if(!isNaN(tableId)){
          tableId = parseInt(tableId);
        }
        if(
          !allAvailable
          &&
          thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
        ){
          table.classList.add(classNames.booking.tableBooked);
        }else{
          table.classList.remove(classNames.booking.tableBooked);
        }
      }
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
        thisBooking.dom.tables = element.querySelectorAll(select.booking.tables);
        thisBooking.dom.floor = element.querySelector(select.booking.floorPlan);
        thisBooking.dom.orderConfirmation = element.querySelector(select.booking.orderConfirmation);
        thisBooking.dom.phoneNumber = element.querySelector(select.booking.phoneNumber);
        thisBooking.dom.address = element.querySelector(select.booking.address);
        thisBooking.dom.form = element.querySelector(select.booking.form);
        thisBooking.dom.starters = element.querySelectorAll(select.booking.starters);
    }

    initWidgets(){
        const thisBooking = this;
        
        thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
        thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
        thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
        thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

        thisBooking.dom.peopleAmount.addEventListener('click', function(event){
            event.preventDefault();
            console.log(thisBooking.peopleAmount);
        });

        thisBooking.dom.hoursAmount.addEventListener('click', function(event){
            event.preventDefault();
            console.log(thisBooking.hoursAmount);
        });

        thisBooking.dom.datePicker.addEventListener('click', function(event){
            event.preventDefault();
            console.log(thisBooking.datePicker);
        });

        thisBooking.dom.hourPicker.addEventListener('click', function(event){
            event.preventDefault();
            console.log(thisBooking.hourPicker);
        });

        thisBooking.dom.wrapper.addEventListener('updated', function(){
          thisBooking.updateDOM();
          console.log('thisBooking.dom.wrapper', thisBooking.dom.wrapper);
          if (thisBooking.selectedTable){
            const selectedTable = thisBooking.dom.floor.querySelector(`[data-table="${thisBooking.selectedTable}"]`)
            selectedTable.classList.remove(classNames.booking.tableSelected);
          }
        })
    }

    selectTable(){
      const thisBooking = this;
      thisBooking.selectedTable = '';

      thisBooking.dom.floor.addEventListener('click', function(event){
        event.preventDefault();
        const targetEvent = event.target;
        const tableNumber = targetEvent.getAttribute(settings.booking.tableIdAttribute);

        if(!tableNumber){
          return;
        }

        if(targetEvent.classList.contains(classNames.booking.tableBooked)){
          return;
        }

        for(const table of thisBooking.dom.tables){
          if(table !== targetEvent){
            table.classList.remove(classNames.booking.tableSelected);
          }
        }

        targetEvent.classList.toggle(classNames.booking.tableSelected);
        
        if(targetEvent.classList.contains(classNames.booking.tableSelected)){
          thisBooking.selectedTable = parseInt(tableNumber);
        }
        console.log('thisBooking.selectedTable', thisBooking.selectedTable);
      })
    }

    initActions(){
      const thisBooking = this;
      thisBooking.dom.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisBooking.sendBooking();
      })
    }


    sendBooking(){
      const thisBooking = this;
      
      const url = settings.db.url + '/' + settings.db.bookings;

      const payload = {};
      payload.date = thisBooking.datePicker.correctValue;
      payload.hour = thisBooking.hourPicker.correctValue;
      payload.table = thisBooking.selectedTable;
      payload.duration = thisBooking.hoursAmount.correctValue;
      payload.ppl = thisBooking.peopleAmount.correctValue;
      payload.starters = [];
      payload.phone = thisBooking.dom.phoneNumber.value;
      payload.address = thisBooking.dom.address.value;
      
      for(const starter of thisBooking.dom.starters){
        if(starter.checked && !payload.starters.includes(starter.value)){
          payload.starters.push(starter.value);
        }
      }


      const options = { 
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      };

      fetch(url, options)
        .then(function(response){
          return response.json();
        }).then(function(parsedResponse){
          console.log('parsedResponse', parsedResponse);
          thisBooking.makeBooked(
            parsedResponse.date, 
            parsedResponse.hour, 
            parsedResponse.duration, 
            parsedResponse.table
          )
        })

      
      console.log(payload);
    }

}

export default Booking;