<script>
    import { Container, Row, Col } from 'sveltestrap'
    export let title;
    export let description;
    export let imgSrc;
</script>

<style>
    li {
        list-style: none;
        background-color: #eeeeee;
    }

    img {
        width: 100%;
    }
</style>

<li class="mb-2">
    <Container>
        <Row>
            <Col>
                <h1>{title}</h1>
            </Col>
        </Row>
        <Row>
            <Col sm="4"><img src={imgSrc} alt=""></Col>
            <Col sm="8">{description}</Col>
        </Row>
    </Container> 
</li>
<hr/>
