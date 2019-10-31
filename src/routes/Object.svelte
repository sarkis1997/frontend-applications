<svelte:head>
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
  <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.8.1/css/all.css" integrity="sha384-50oBUHEmvpQ+1lW4y57PTFmhCaXp0ML5d60M1M7uH2+nqUivzIebhndOJK28anvf" crossorigin="anonymous">
</svelte:head>

<script>
  import Header from '../components/header.svelte'
  import Items from '../components/fetch.svelte'
  import { Container, Row, Col } from 'sveltestrap'
</script>

<Header/>
<Container>
  <Row>
    <Col xs="1">
      dit is specifiek per product
    </Col>
    <Col>
      <Items/>
    </Col>
  </Row>
</Container>