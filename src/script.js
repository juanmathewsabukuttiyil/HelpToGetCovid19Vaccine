    document.getElementById("appSec").style = "display:none";
    const FULL_DASH_ARRAY = 283;
    const WARNING_THRESHOLD = 10;
    const ALERT_THRESHOLD = 5;

    const COLOR_CODES = {
        info: {
        color: "green"
        },
        warning: {
        color: "orange",
            threshold: WARNING_THRESHOLD
        },
        alert: {
        color: "red",
            threshold: ALERT_THRESHOLD
        }
    };

    let TIME_LIMIT = 30;
    let timePassed = 0;
    let timeLeft = TIME_LIMIT;
    let timerInterval = null;
    let remainingPathColor = COLOR_CODES.info.color;
    let attempt = 1;
    let existingIdentification = 0;

    function onTimesUp(isPincodeSearch) {
        clearInterval(timerInterval);
        getAvailability(isPincodeSearch);
    }

    function startTimer(isPincodeSearch) {
        timerInterval = setInterval(() => {
            timePassed = timePassed += 1;
            timeLeft = TIME_LIMIT - timePassed;
            document.getElementById("base-timer-label").innerHTML = "Retry in " + formatTime(
                timeLeft
            );
            setCircleDasharray();
            setRemainingPathColor(timeLeft);

            if (timeLeft === 0) {
                onTimesUp(isPincodeSearch);
            }
        }, 1000);
    }

    function formatTime(time) {
        const minutes = Math.floor(time / 60);
        let seconds = time % 60;

        if (seconds < 10) {
        seconds = `0${seconds}`;
        }

        return `${minutes}:${seconds}`;
    }

    function setRemainingPathColor(timeLeft) {
        const {alert, warning, info} = COLOR_CODES;
        if (timeLeft <= alert.threshold && timeLeft != 1 && timeLeft != 0) {
        document
            .getElementById("base-timer-path-remaining")
            .classList.remove(warning.color);
            document
                .getElementById("base-timer-path-remaining")
                .classList.add(alert.color);
        } else if (timeLeft <= warning.threshold && timeLeft != 1 && timeLeft != 0) {
        document
            .getElementById("base-timer-path-remaining")
            .classList.remove(info.color);
            document
                .getElementById("base-timer-path-remaining")
                .classList.add(warning.color);
        } else if (timeLeft == 1) {
        document
            .getElementById("base-timer-path-remaining")
            .classList.remove(alert.color);
            document
                .getElementById("base-timer-path-remaining")
                .classList.add(info.color);
        }
    }

    function calculateTimeFraction() {
        const rawTimeFraction = timeLeft / TIME_LIMIT;
        return rawTimeFraction - (1 / TIME_LIMIT) * (1 - rawTimeFraction);
    }

    function setCircleDasharray() {
        const circleDasharray = `${(
        calculateTimeFraction() * FULL_DASH_ARRAY
    ).toFixed(0)} 283`;
        document
            .getElementById("base-timer-path-remaining")
            .setAttribute("stroke-dasharray", circleDasharray);
    }

    $(function () {
        getStates();
    })

    const baseURL = 'https://cdn-api.co-vin.in/api/v2';

    function getAvailability(isPincodeSearch) {
        var globalURL = "";
        var globalData = "";
        var pincode = $("#pincodeInput").val();
        var stateId = $("#states option:selected").val();
        var districtId = $("#district option:selected").val();
        var identification = isPincodeSearch ? pincode : districtId;
        if (identification != existingIdentification) {
        attempt = 1;
        }
        existingIdentification = identification;
        if (isPincodeSearch || (stateId > 0 && districtId > 0)) {
            if (isPincodeSearch) {
                var pinCodeInputString = $("#pincodeInput").val();
                if (pinCodeInputString == "") {
                    document.getElementById("data").innerHTML = "";
                    document.getElementById("appSec").style = "display:none";
                    clearInterval(timerInterval);
                    triggerErrorPopUp("Please enter PIN Code.")
                    return null;
                }
                else {
                    if (!(/^[1-9][0-9]{5}$/).test(pinCodeInputString)) {
                        document.getElementById("data").innerHTML = "";
                        document.getElementById("appSec").style = "display:none";
                        clearInterval(timerInterval);
                        triggerErrorPopUp("PIN Code you entered is invalid. Please enter a valid PIN Code.")
                        return null;
                    }
                }
            }
            // var selectedDate = $("#date option:selected").val();
            var todaysDate = new Date();
            const options = {dateStyle: 'short' };
            const date = todaysDate.toLocaleString('hi-IN', options);
            if (isPincodeSearch) {
        globalURL = baseURL + '/appointment/sessions/public/calendarByPin';
                globalData = {
        "pincode": pincode,
                    "date": date
                };
            }
            else {
        globalURL = baseURL + '/appointment/sessions/public/calendarByDistrict';
                globalData = {
        "district_id": districtId,
                    "date": date
                };
            }
            document.getElementById("data").innerHTML = "";
            $.ajax({
        type: 'GET',
                url: globalURL,
                data: globalData,
                success: function (resp) {
    }
            }).done(
                function (response) {
        let avaliableCenterDatas = "";
                    let centerDatas = "";
                    if (response.centers != undefined && response.centers.length > 0) {
        let availabilityFound = false;
                        response.centers.forEach(center => {
        let availabilityFoundTemp = false;
                            center.sessions.forEach(session => {
                                if (session.available_capacity > 0) {
        availabilityFoundTemp = true;
                                    availabilityFound = true;
                                }
                            });
                            if (availabilityFoundTemp) {
        avaliableCenterDatas += setVaccineCard(center, availabilityFoundTemp);
                            }
                            else {
        centerDatas += setVaccineCard(center, availabilityFoundTemp);
                            }
                        });

                        if (availabilityFound) {
        play();
                            document.getElementById("appSec").style = "display:none";
                            clearInterval(timerInterval);
                        } else {
        TIME_LIMIT = 30
                            timePassed = 0;
                            document.getElementById("appSec").style = "display:block";
                            document.getElementById("app").innerHTML = `
                                <div class="base-timer">
        <svg class="base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <g class="base-timer__circle">
                <circle class="base-timer__path-elapsed" cx="50" cy="50" r="45"></circle>
                <path
                    id="base-timer-path-remaining"
                    stroke-dasharray="283"
                    class="base-timer__path-remaining ${remainingPathColor}"
                    d="
                                          M 50, 50
                                          m -45, 0
                                          a 45,45 0 1,0 90,0
                                          a 45,45 0 1,0 -90,0
                                        "
                ></path>
            </g>
        </svg>
        <span id="base-timer-label" class="base-timer__label base-timer__label_time">Retry in ${formatTime(
            timeLeft
        )}</span>
        <span id="base-timer-label" class="base-timer__label base-timer__label_found">Vaccine not avaliable !</span>
        <span id="base-timer-label" class="base-timer__label base-timer__label_attempt">Attempt : ${attempt}</span>
    </div>
                                `;
                            clearInterval(timerInterval);
                            startTimer(isPincodeSearch);
                            attempt++;
                        }
                    } else {
                        document.getElementById("data").innerHTML = "";
                        document.getElementById("appSec").style = "display:none";
                        clearInterval(timerInterval);
                        triggerErrorPopUp("No Co-WIN centres are available at your PIN Code/District. Please search using another PIN Code/District.");
                    }
                    document.getElementById("data").innerHTML = avaliableCenterDatas + centerDatas;
                }).fail(function (data) {
                    document.getElementById("data").innerHTML = "";
                    document.getElementById("appSec").style = "display:none";
                    clearInterval(timerInterval);
                    triggerErrorPopUp("Co-WIN system not responding now!!! Please try after sometime.")
                });
        } else {
            document.getElementById("data").innerHTML = "";
            document.getElementById("appSec").style = "display:none";
            clearInterval(timerInterval);
            triggerErrorPopUp("Please select State and District.")
        }
    }

    function triggerErrorPopUp(message) {
        document.getElementById("errorMessageSec").innerHTML = message;
        $("#modalButton").click();
    }

    function setVaccineCard(center, availabilityFoundTemp) {
        var vaccineCardResult = "";
        var avatarStyle = "";
        if (availabilityFoundTemp) {
        avatarStyle = "style = 'border: 6px #3bff41 solid;'";
        }
        var feeType = center.fee_type == "Free" ? "style = 'background: #048604'" : "style = 'background: #2152b3'";
        vaccineCardResult += `
                            <div class="col-md-6 col-lg-4 pb-3 vaccineCard">
        <div class="card card-custom bg-white border-white border-0" style="height: 450px">
            <div class="card-custom-img"></div>
            <div class="card-custom-avatar">
                <img class="img-fluid" src="src/images/icon.jpg" alt="Avatar" ${avatarStyle} />
            </div>
            <div class="card-body" style="overflow-y: auto">
                <h4 class="card-title">${center.name} <span class="freeText" ${feeType}> ${center.fee_type}</span></h4>
                <div>
                    ${getSessions(center.sessions)}
                </div>
                <div>
                    <div class="priceTabOutter">
                        ${getVaccineAndFee(center.vaccine_fees)}
                    </div>
                </div>
                <p class="card-text card-text-address"><span class="fa fa-address-book-o"></span> ${center.address},</p>
                <p class="card-text card-text-address"><span class="fa fa-home"></span> ${center.district_name},</p>
                <p class="card-text card-text-address"><span class="fa fa-map-marker"></span> ${center.state_name},</p>
                <p class="card-text card-text-address"><span class="fa fa-pencil-square-o"></span> ${center.pincode}</p>
                <p class="card-text card-text-address"><span class="fa fa-clock-o"></span> ${center.from} - ${center.to}</p>
            </div>
            <div class="card-footer" style="background: inherit; border-color: inherit;">
                <a href="https://selfregistration.cowin.gov.in/" target="_blank" class="btn btn-primary">Book Now</a>
            </div>
        </div>
    </div>
                        `;
        return vaccineCardResult;
    }

    function getVaccineAndFee(vaccine_fees) {
        var vaccineFeeResult = "";
        if (vaccine_fees != undefined && vaccine_fees.length > 0) {
        vaccine_fees.forEach(obj => {
            vaccineFeeResult += `              
                      <div class="priceTab">
                          <div class="vaccineNameForPrice">${obj.vaccine}</div>
                          <div class="vaccinePrice"><span class="fa fa-inr"></span>${obj.fee}</div>
                      </div>
                `
        })
    }
        return vaccineFeeResult;
    }

    function getSessions(sessions) {
        var sessionsData = "";
        if (sessions != undefined && sessions.length > 0) {
        sessions.forEach(session => {
            if (session.available_capacity > 0) {
                sessionsData += `
                 <div class="sessionOutter">
                      <div class="sessionAvaliablityOutter">
                          <div class="vaccineNameForSession">${session.vaccine}</div>
                          <div class="vaccineDateForSession">${session.date}</div>
                      </div>
                        <div class="sessionAvaliablityOutter">
                                                  <div class="vaccineDateForSession f-12">Dose 1</div>
                        <div class="vaccineNameForSession f-12">${session.available_capacity_dose1}</div>
                                              </div>
                        <div class="sessionAvaliablityOutter">
                                                  <div class="vaccineDateForSession f-12">Dose 2</div>
                        <div class="vaccineNameForSession f-12">${session.available_capacity_dose2}</div>
                                              </div>
                        <div class="sessionAvaliablityOutter">
                          <div class="vaccineNameForSession f-12">AGE</div>
                          <div class="vaccineDateForSession f-12">${session.min_age_limit}+</div>
                      </div>
                  </div>
                    `
            }
        })
    }
        return sessionsData;
    }

    function getSlots(session) {
        var slotsData = "";

        if (session.slots != undefined && session.slots.length > 0 && session.available_capacity > 0) {
        slotsData +=
        `
                    <span>Date : ${session.date}</span>
                    <span>Min Age Limit : ${session.min_age_limit}</span>
                    <span>Time Slots </span>
                `
            session.slots.forEach(slot => {
        slotsData +=
        `<span>${slot}</span>`
    })
        }
        return slotsData;
    }

    function getDistricts() {
        document.getElementById("data").innerHTML = "";
        var stateId = $("#states option:selected").val();
        $.ajax({
        type: 'GET',
            url: baseURL + '/admin/location/districts/' + stateId,
            success: function (resp) {
    }
        }).done(
            function (response) {
        let districtsOptionsHTML = "<option selected>Select District</option>";
                if (response.districts != undefined && response.districts.length > 0) {
        response.districts.forEach(element => {
            districtsOptionsHTML += `
                    <option value="${element.district_id}"> ${element.district_name} </option>`
        });
                    document.getElementById("district").innerHTML = districtsOptionsHTML;
                }
            }).fail(function (data) {
                document.getElementById("data").innerHTML = "";
                document.getElementById("appSec").style = "display:none";
                clearInterval(timerInterval);
                triggerErrorPopUp("Co-WIN system not responding now!!! Please try after sometime.")
            });
    }

    function getStates() {
        $.ajax({
            type: 'GET',
            url: baseURL + '/admin/location/states',

            success: function (resp) {
            }
        }).done(
            function (response) {
                let statesOptionsHTML = "<option selected> Select State </option> ";
                if (response.states != undefined && response.states.length > 0) {
                    response.states.forEach(element => {
                        statesOptionsHTML += `
                    <option value="${element.state_id}"> ${element.state_name} </option>`
                    });
                    document.getElementById("states").innerHTML = statesOptionsHTML;
                }
            }).fail(function (data) {
                document.getElementById("data").innerHTML = "";
                document.getElementById("appSec").style = "display:none";
                clearInterval(timerInterval);
                triggerErrorPopUp("Co-WIN system not responding now!!! Please try after sometime.")
            });
    }

    function play() {
        var audio = new Audio('audio.mp3');
        audio.play();
    }
