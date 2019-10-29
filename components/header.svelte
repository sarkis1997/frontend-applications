<script>
  import { Container, Row, Col, Nav, NavItem, NavLink } from 'sveltestrap';
  
  let Logo = '../public/images/wmnv-logo.jpg'
</script>

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
			<h1>Slavernij sinds 1700</h1>
		</Col>
	</Row>
	<hr/>
</Container>