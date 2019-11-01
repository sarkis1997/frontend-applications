<svelte:head>
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
  <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.8.1/css/all.css" integrity="sha384-50oBUHEmvpQ+1lW4y57PTFmhCaXp0ML5d60M1M7uH2+nqUivzIebhndOJK28anvf" crossorigin="anonymous">
</svelte:head>

<script>
  import Header from './components/header.svelte'
  import Items from './components/fetch.svelte'
  import { Container, Row, Col } from 'sveltestrap'
  import { Router, Route } from "svelte-routing";
  export let url = "";

  //routes
  import ObjectItem from './routes/Object.svelte'
  
</script>

<Router url="{url}">
  	<div>
      <Route path="/item" component="{ObjectItem}" />
  	</div>
</Router>


<Header/>
<Container>
  <Row>
    <Col xs="1" style="border: 1px solid grey">
      Timeline
    </Col>
    <Col>
      <Items/>
    </Col>
  </Row>
</Container>