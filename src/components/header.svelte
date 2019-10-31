<script>
  import { Container, Row, Col, Nav, NavItem, NavLink } from 'sveltestrap';
  import Logo from '../../spublic/images/wmnv-logo.svg'
</script>

<style>
img { 
	width: 5em;
	height: 5em;
}
</style>

<Container>
	<Row>
		<Col>
			<NavLink href="#" class="text-center">
				<img src={Logo} alt="">
			</NavLink>
		</Col>
	</Row>
	<hr/>
	<Row>
		<Col class="text-center">
			<h1>Slavernij sinds () </h1>
		</Col>
	</Row>
	<hr/>
</Container>