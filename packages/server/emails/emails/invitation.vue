<script setup>
usePlaintext()
</script>

<template>
  <Html lang="en">
    <Head />
    <Body class="bg-gray-100 font-sans">
      <Container class="mx-auto my-8 max-w-xl rounded bg-white p-8">
        <Text class="hidden"><Raw>{{preheader}}</Raw></Text>
        <Heading><Raw>{{heading}}</Raw></Heading>
        <Text><Raw>{{intro}}</Raw></Text>
        <Text><Raw>{{expiry}}</Raw></Text>
        <Button :href="'{{actionUrl}}'"><Raw>{{actionLabel}}</Raw></Button>
        <Text><Raw>{{linkHint}}</Raw><br><Raw>{{actionUrl}}</Raw></Text>
        <Text><Raw>{{ignore}}</Raw></Text>
      </Container>
    </Body>
  </Html>
</template>
