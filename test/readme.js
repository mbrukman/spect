import t from 'tst'
import $ from '..'

t('readme: A simple aspect', async t => {
  let el = document.body.appendChild(document.createElement('div'))
  el.id = 'hello-example'

  function helloMessage(el) {
    let $el = $(el)
    $el.html`<div.message>
    Hello, ${ $el.prop('name') }!
  </div>`
  }

  $('#hello-example').use(helloMessage).prop('name', 'Taylor')

  await Promise.resolve().then()

  t.is(el.outerHTML, '<div id="hello-example"><div class="message">Hello, Taylor!</div></div>')

  document.body.removeChild(el)
})

t('readme: A stateful aspect', t => {
  let el = document.body.appendChild(document.createElement('div'))
  el.id = 'timer-example'

  $('#timer-example').use(el => {
    let $el = $(el)

    // init
    $el.state({ seconds: 0 }, [])

    // start timer when connected
    $el.mount(() => {
      let i = setInterval(() => $el.state(s => s.seconds++), 1000)

      // disconnected
      return () => clearInterval(i)
    })

    // html is side-effect, not aspect result
    $el.html`Seconds: ${ $el.state('seconds') }`
  })

  t.is($('#timer-example')[0].innerHTML, 'Seconds: 0')
  document.body.removeChild(el)
})
