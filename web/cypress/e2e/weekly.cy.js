describe('weekly view', () => {
  const apiUrl = 'http://localhost:3333'

  // mobx does an `isPlainObject` test that fails if the object is created
  // in a different window context, so we need to create any objects
  // with the app window
  const winObj = (win) => (obj) => win.Object.assign(win.Object.create(null), obj)

  beforeEach(() => {
    cy.fixture('location')
    .then((location) => {
      cy.fixture('weather').then((weather) => {
        cy.visit('/', {
          onBeforeLoad (win) {
            cy.stub(win.navigator.geolocation, 'getCurrentPosition').yields({
              coords: {
                latitude: 1,
                longitude: 2,
              },
            })

            const o = winObj(win)

            cy.stub(win, 'fetch')
            win.fetch
            .withArgs(`${apiUrl}/location-details?latlng=1,2`)
            .resolves({ json: () => location })
            win.fetch
            .withArgs(`${apiUrl}/weather?location=1,2`)
            .resolves({
              json: () => o({
                currently: o(weather.currently),
                hourly: o({
                  data: weather.hourly.data.map((hour) => o(hour)),
                }),
                daily: o({
                  data: weather.daily.data.map((day) => o(day)),
                }),
              }),
            })
          },
        })
      })
    })
  })

  it('shows current temperature', () => {
    cy.get('.current .temp').should('have.text', '76°F')
  })
})
