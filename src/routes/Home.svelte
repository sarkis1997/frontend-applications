<svelte:head>
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
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
     bar
    </Col>
    <Col>
      <Items/>
    </Col>
  </Row>
</Container>