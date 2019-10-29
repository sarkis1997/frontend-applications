<script>
    import { Container, Row, Col } from 'sveltestrap'
    export let title;
    export let description;
    export let img;
</script>

<style>
    li {
        list-style: none;
    }
</style>

<li>
    <Container>
        <Row>
            <Col>
                <h1>{title}</h1>
            </Col>
        </Row>
        <Row>
            <Col sm="4">{img}</Col>
            <Col sm="8">{description}</Col>
        </Row>
    </Container> 
</li>
