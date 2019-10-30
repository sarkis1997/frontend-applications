<script context="module">

export let filterHTML = (obj) => {
    // replace alles tussen < html tags > en &nbsp;
    obj.description.value = obj.description.value.replace(/(<([^>]+)>)|&nbsp;/g, ' ');
}

</script>