<script>
    import { Container, Row, Col } from 'sveltestrap'
    export let title;
    export let description;
    export let imgSrc;
    export let period;
</script>

<style>
    h1 {
        font-size: 1.7em;
    }
    li {
        list-style: none;
        background-color: #eeeeee;
    }
    img {
        width: 100%;
    }
    .period {
        display: flex;
        justify-content: end;
        margin: auto;
    }
</style>

<li class="mb-2">
    <Container class="p-5">
        <Row>
            <Col sm="10">
                <h1 class="text-center;">{title}</h1>
            </Col>
            <Col class="m-auto">
                <span class='period'>{period}</span>
            </Col>
        </Row>
        <hr/>
        <Row>
            <Col sm="4"><img src={imgSrc} alt=""></Col>
            <Col sm="8">{description}</Col>
        </Row>
    </Container> 
</li>
<hr/>
