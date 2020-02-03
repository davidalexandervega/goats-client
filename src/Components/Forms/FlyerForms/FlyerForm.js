import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import '../Forms.css';
import AuthedContext from '../../../AuthedContext';
import EventFieldset from './EventFieldset';
import EventsPreview from './EventsPreview';
import FlyerUpload from '../ImageUpload/FlyerUpload';
import ValidationError from '../ValidationError/ValidationError';
import ContentEditable from '../ContentEditable';
//import DUMMY from '../../../DUMMY';
const uuid = require('uuid/v1');

export default function FlyerForm({ history, newType, flyer, events, creatorId }) {
  const authedContext = useContext(AuthedContext)
  const flyerEvents = events.filter(event => event.flyer_id == flyer.id)
  const [formBody, setFormBody] = useState({
    id: flyer.id || '',
    imgUrl: { value: flyer.image_url || '' , error: ''},
    headline: { value: flyer.headline || '', touched: false, error: '' },
    events: flyerEvents || [],
    //
    date: { value: '', touched: false, error: ''},
    endDate: { value: '', touched: false, error: '' },
    venueName: { value: '', touched: false, error: ''},
    countryName: { value: '', code: ''},
    regionName: { value: '', array: [] },
    cityName: { value: '', touched: false, error: '' },
    //
    bands: { value: flyer.bands || '', touched: false, error: '' },
    details: { value: flyer.details|| '', touched: false, error: '' },
    publishComment: { value: flyer.publish_comment || '', touched: false, error: '' },
    creatorId: flyer.creator_id || creatorId,
    type: flyer.type || newType,
    listingState: flyer.listing_state || "Public",
    created: flyer.created || ''
  })
  const [disabled, setDisabled] = useState(true)
  const [touched, setTouched] = useState(false)
  const [showFestEvents, setShowFestEvents] = useState([])
  // const [serverError, setServerError] = useState(null)

  const resetForm = () => {
    setFormBody({
      id: flyer.id || '',
      imgUrl: { value: flyer.image_url || '', error: '' },
      headline: { value: flyer.headline || '', touched: false, error: '' },
      events: flyerEvents || [],
      date: { value: '', touched: false, error: '' },
      endDate: { value: '', touched: false, error: '' },
      venueName: { value: '', touched: false, error: '' },
      countryName: { value: '', code: '' },
      regionName: { value: '', array: [] },
      cityName: { value: '', error: '' },
      bands: { value: flyer.bands || '', touched: false, error: '' },
      details: { value: flyer.details || '', touched: false, error: '' },
      publishComment: { value: flyer.publish_comment || '', touched: false, error: '' },
      creatorId: flyer.creator_id || creatorId,
      type: flyer.type || newType,
      listingState: flyer.listing_state || "Public",
      created: flyer.created || ''
    })
  }

  const resetEventFields = () => {
    setFormBody(prev => ({
      ...prev,
      date: { value: '', touched: false, error: '' },
      endDate: { value: '', touched: false, error: '' },
      venueName: { value: '', touched: false, error: '' },
      countryName: { value: '', code: '' },
      regionName: { value: '', array: [] },
      cityName: { value: '', error: '' },
    }))
  }

  useEffect(() => {
    setFormBody(prev => ({ ...prev, type: newType }))
    resetForm()
  }, [newType])


  useEffect(() => {
    const setDisabledIfErrors = () => {
      let errors = Object.values(formBody).filter(value => value && Boolean(value.error))
      if (errors.length > 0 || !Boolean(formBody.headline.value) || !Boolean(formBody.imgUrl.value)) {
        setDisabled(true)
      } else {
        setDisabled(false)
      }
    }
    const touched = () => {
      let touched = Object.values(formBody).filter(value => value && Boolean(value.touched) && Boolean(value.value))
      if (touched.length > 0) {
        setTouched(true)
      } else {
        setTouched(false)
      }
    }
    setDisabledIfErrors()
    touched()
  }, [formBody])

  const updateEventFields = (fields) => {
    setFormBody(prev => ({ ...prev, ...fields }))
  }

  const updateImgUrl = (url) => {
    setFormBody(prev => ({ ...prev, imgUrl: { value: url } }))
  }

  const updateImgError = (error) => {
    setFormBody(prev => ({ ...prev, imgUrl: { ...prev.imgUrl, error: error } }))
  }

  // handleSubmit, addShowOrFestStop (postBody) Helpers
  String.prototype.capitalize = function () {
    return this.replace(/(?:^|\s)\S/g, function (a) { return a.toUpperCase(); });
  };
  const dateWithYear = (mmddFormat) => {
    let currYear = new Date().getFullYear()
    let testDateCurrYear = new Date(mmddFormat + '/' + currYear)
    let currDate = new Date()
    let testIfNeg = testDateCurrYear - currDate
    let year = testIfNeg > 0 ? currYear : currYear + 1
    return new Date(mmddFormat + '/' + year)
  }
  const returnCleanContentEditable = (fieldStr) => {
    return formBody[fieldStr].value.replace(/(<[^>]*>)|(&nbsp;)/g, "")
  }
  const dateToMMDDString = (date) => {
    return ((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))) + '/' + ((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate()))
  }

  const returnShowFestEventsArr = () => {
    if (formBody.type === "Show" || formBody.type === "Fest") {

      let eventFields = ["date", "endDate", "venueName", "countryName", "regionName", "cityName"]
      let invalidValues = eventFields.filter(field => {
        if (Boolean(formBody[field].error)) {
          return formBody[field].value
        }
      })
      let validValues = eventFields.filter(field => {
        if (!Boolean(formBody[field].error) && Boolean(formBody[field].value)) {
          return formBody[field].value
        }
      })

      if (invalidValues.length === 0 && validValues.length > 0) {
        let dayCount = formBody.type === "Fest"
          ? (dateWithYear(formBody.endDate.value) - dateWithYear(formBody.date.value)) / 86400000
          : 1

        function addDaysToDateReturnMMDDString(date, days) {
          const copy = new Date(Number(dateWithYear(date)))
          copy.setDate(dateWithYear(date).getDate() + days)
          return dateToMMDDString(copy)
        }

        let eventsArr = []
        if ((formBody.date.touched && !Boolean(formBody.date.error)) && (!formBody.endDate.touched || Boolean(formBody.endDate.error))) {
          for (let i = 0; i < 1; i++) {
            let newEvent = {
              id: uuid(),
              date: addDaysToDateReturnMMDDString(formBody.date.value, i),
              venueName: formBody.venueName.value,
              countryName: formBody.countryName.value,
              regionName: formBody.regionName.value,
              cityName: formBody.cityName.value
            }
            eventsArr.push(newEvent)
          }
        } else if ((formBody.date.touched && !Boolean(formBody.date.error)) && (formBody.endDate.touched && !Boolean(formBody.endDate.error))) {
          for (let i = 0; i <= dayCount && i < (dayCount +1); i++) {
            let newEvent = {
              id: uuid(),
              date: addDaysToDateReturnMMDDString(formBody.date.value, i),
              venueName: formBody.venueName.value,
              countryName: formBody.countryName.value,
              regionName: formBody.regionName.value,
              cityName: formBody.cityName.value
            }
            eventsArr.push(newEvent)
          }
        }
        console.log('finished setting events', eventsArr)
        return eventsArr
      }
      return []
    }
    return []
}

  useEffect(() => {
    if (formBody.type === "Show" || formBody.type === "Fest") {
      let showFestEventsArr = returnShowFestEventsArr()
      function setNewEvents() {
        return setFormBody(prev => ({ ...prev, events: [...showFestEventsArr] }))
      }
      return setNewEvents()
    }
  }, [
    formBody.date.value,
    formBody.endDate.value,
    formBody.venueName.value,
    formBody.countryName.value,
    formBody.regionName.value,
    formBody.cityName.value
  ])


  const handleSubmit = async(e) => {
    e.preventDefault()

    if (e.target.value === "Draft") {
      setFormBody(prev => ({ ...prev, listing_state: "Draft" }))
    }

    let generatedFlyerId = uuid()
    let generatedModified = new Date(Date.now())
    const flyerPostBody = {
      id: Boolean(formBody.id) ? formBody.idtoString() : generatedFlyerId,
      creator_id: formBody.creatorId.toString(),
      type: formBody.type,
      image_url: formBody.imgUrl.value,
      headline: formBody.headline.value.capitalize(),
      bands: returnCleanContentEditable("bands"),
      details: returnCleanContentEditable("details"),
      publish_comment: returnCleanContentEditable("publishComment"),
      listing_state: formBody.listingState,
      created: Boolean(formBody.created) ? formBody.created : generatedModified,
      modified: generatedModified
    }

    const eventPostBodies = formBody.events.map(event => {
      return {
        id: event.id,
        flyer_id: generatedFlyerId,
        date: dateWithYear(event.date),
        venue_name: event.venueName.capitalize(),
        city_name: event.cityName.capitalize(),
        region_name: event.regionName,
        country_name: event.countryName
      }
    })

    authedContext.addFlyer(flyerPostBody)
    eventPostBodies.forEach(eventPostBody => {
      authedContext.addEvent(eventPostBody)
    })
    resetForm()
    history.push(`/dashboard/${formBody.creatorId}`)


  //   const flyerOptions = {
  //     method: 'POST',
  //     body: JSON.stringify(flyerPostBody),
  //     headers: {
  //       "Content-Type": "application/json",
  //     }
  //   }
  //   const response = await fetch(`${config.API_ENDPOINT}/api/flyer`, flyerOptions)
  //   const body = await response.json();

  //   if (!response.ok) {
  //     setServerError(body)
  //   } else {
  //     resetForm()
  //     let user = body.token ? body : null
  //     context.updateAuthenticated(user)
  //     props.history.push(`/forum`)
  //   }
  // }
  }



  const validateHeadline = () => {
    if (formBody.headline.touched) {
      const trimmedHeadline = formBody.headline.value.trim()
      return trimmedHeadline.length === 0
        ? 'Headline required'
        : trimmedHeadline.length > 100
        ? `${trimmedHeadline.length - 100} over 100 character max limit.`
        : ''
    }
    return ''
  }

  const updateValidationErrors = () => {
    setFormBody(prev => ({ ...prev, headline: { ...prev.headline, error: validateHeadline()}}))
  }

  const validateContentEditableLength = (fieldStr, maxLength) => {
    let stringNoHtml = formBody[fieldStr].value ? formBody[fieldStr].value.replace(/(<[^>]*>)|(&nbsp;)/g, "") : ""
    let stringNoSpace = stringNoHtml.replace(/\s/g, "")
    if (stringNoSpace.length >= maxLength) {
      return `Keep it under ${maxLength} characters`
    }
    return ""
  }


  //EventFieldset
  const addTourStop = (e) => {
    e.preventDefault()

    let eventFields = ["date", "endDate", "venueName", "countryName", "regionName", "cityName"]
    let invalidValues = eventFields.filter(field => {
      if (Boolean(formBody[field].error)) {
        return formBody[field].value
      }
    })
    let validValues = eventFields.filter(field => {
      if (!Boolean(formBody[field].error) && Boolean(formBody[field].value)) {
        return formBody[field].value
      }
    })
    if(invalidValues.length === 0 && validValues.length > 0) {
      let generatedEventId = uuid()
      setFormBody(prev => ({
        ...prev,
        events: [
          ...prev.events,
          {
            id: generatedEventId,
            date: formBody.date.value,
            venueName: formBody.venueName.value,
            countryName: formBody.countryName.value,
            regionName: formBody.regionName.value,
            cityName: formBody.cityName.value
          }
        ]
      }))
      resetEventFields()
    }
  }
  const deleteFormEvent = (id) => {
    let filteredEvents = formBody.events.filter(event => event.id !== id)
    setFormBody(prev => ({
      ...prev,
      events: filteredEvents
    }))
  }
  //

  return(
    <form className="FlyerForm" onSubmit={handleSubmit}>
      <FlyerUpload formImgUrl={formBody.imgUrl} updateImgUrl={updateImgUrl} updateImgError={updateImgError} />
      <fieldset>
        <label htmlFor="headline">Headline*</label>
        <input
          id="headline"
          name=""
          type="text"
          placeholder={`${newType} Headline`}
          value={formBody.headline.value || ''}
          onChange={e => {
            e.persist()
            return setFormBody(prev => ({ ...prev, headline: { value: e.target.value, touched: true } }))
          }}
          aria-label="headline"
          aria-required="true"
          aria-describedby="headlineError"
          aria-invalid={!!formBody.headline.error}
          onBlur={updateValidationErrors}
        />
        <ValidationError id="headlineError" message={formBody.headline.error} />
      </fieldset>
      { formBody.type === "Tour"
        ? (
          <EventsPreview
            formEvents={formBody.events}
            deleteFormEvent={deleteFormEvent}
          />
        )
        : null
      }
      <EventFieldset
        updateEventFields={updateEventFields}
        addTourStop={addTourStop}
        formDate={formBody.date}
        formCountryRegionCity={{ countryName: formBody.countryName, regionName: formBody.regionName, cityName: formBody.cityName}}
        formVenue={formBody.venueName}
        formType={formBody.type}
        formEndDate={formBody.endDate}
      />
      <fieldset>
        <label htmlFor="bands">Band Lineup</label>
        <ContentEditable
          id="bands"
          name="bands"
          className="textarea htmlField"
          html={formBody.bands.value || ''}
          ariaLabel="bands"
          ariaRequired="false"
          ariaDescribedBy="bandsError"
          ariaInvalid={!!formBody.bands.error}
          onChange={e => {
            return setFormBody(prev => ({ ...prev, bands: { value: e.target.value, touched: true, error: validateContentEditableLength("bands", 280) } }))
          }}
        />
        <ValidationError id="bandsError" message={formBody.bands.error} />
      </fieldset>
      <fieldset>
        <label htmlFor="description">Details</label>
        <ContentEditable
          id="details"
          name="details"
          className="textarea htmlField"
          html={formBody.details.value || ''}
          ariaLabel="details"
          ariaRequired="false"
          ariaDescribedBy="detailsError"
          ariaInvalid={!!formBody.details.error}
          onChange={e => {
            return setFormBody(prev => ({ ...prev, details: { value: e.target.value, touched: true, error: validateContentEditableLength("details", 280) } }))
          }}
        />
        <ValidationError id="detailsError" message={formBody.details.error} />
      </fieldset>
      <fieldset>
        <label htmlFor="publishComment">Publish With Comment</label>
        <ContentEditable
          id="publishComment"
          name="publishComment"
          className="textarea htmlField"
          html={formBody.publishComment.value || ''}
          ariaLabel="publishComment"
          ariaRequired="false"
          ariaDescribedBy="publishCommentError"
          ariaInvalid={!!formBody.publishComment.error}
          onChange={e => {
            return setFormBody(prev => ({ ...prev, publishComment: { value: e.target.value, touched: true, error: validateContentEditableLength("publishComment", 280) } }))
          }}
        />
        <ValidationError id="publishCommentError" message={formBody.publishComment.error} />

      </fieldset>
      <div className="form-controls">
        <button type="submit" disabled={disabled} value="Public">Publish</button>
        {/* <button type="button" disabled={!touched} value="Draft" onClick={handleSubmit}>Save As Draft</button> */}
        <input type="reset" onClick={resetForm} value="Cancel" />
      </div>
    </form>
  )
}

FlyerForm.defaultProps = {
  flyer: {},
  events: []
}

FlyerForm.propTypes = {
  newType: PropTypes.oneOf([
    "Fest",
    "Tour",
    "Show"
  ]),
  creatorId: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string
  ]).isRequired,
  flyer: PropTypes.shape({
    id: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string
    ]),
    creator_id: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string
    ]),
    type: PropTypes.oneOf([
      "Fest",
      "Tour",
      "Show"
    ]),
    image_url: PropTypes.string,
    headline: PropTypes.string,
    created: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date)
    ]),
    modified: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date)
    ]),
    bands: PropTypes.string,
    details: PropTypes.string,
    publish_comment: PropTypes.string,
    listing_state: PropTypes.oneOf([
      'Draft',
      'Private',
      'Public',
      'Flagged',
      'Banned',
      'Archived'
    ])
  }),
  events: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string
    ]),
    flyer_id: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string
    ]),
    date: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date)
    ]),
    venue_name: PropTypes.string,
    city_name: PropTypes.string,
    region_name: PropTypes.string,
    country_name: PropTypes.string
  }))
}
