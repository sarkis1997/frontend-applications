<script>
    import { Container, Row, Col} from 'sveltestrap'
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
    <h1>{title}</h1>
    <p>{description}</p>
    <img src={img}>
</li>
