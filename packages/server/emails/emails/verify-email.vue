<script setup>
usePlaintext();
</script>

<template>
  <Html lang="en">
    <Head />
    <Body class="font-sans bg-gray-100">
      <Container class="mx-auto my-8 p-8 rounded bg-white max-w-xl">
        <Text class="hidden">
          <Raw>{{ preheader }}</Raw>
        </Text>
        <Heading><Raw>{{ heading }}</Raw></Heading>
        <Text><Raw>{{ intro }}</Raw></Text>
        <Button href="{{actionUrl}}">
          <Raw>{{ actionLabel }}</Raw>
        </Button>
        <Text><Raw>{{ linkHint }}</Raw><br><Raw>{{ actionUrl }}</Raw></Text>
        <Text><Raw>{{ ignore }}</Raw></Text>
      </Container>
    </Body>
  </Html>
</template>
