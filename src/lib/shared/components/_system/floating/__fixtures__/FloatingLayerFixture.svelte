<script lang="ts">
    import AppLayer from "$core/_system/layout/app-layer/AppLayer.svelte";
    import AppLayerHost from "$core/_system/layout/app-layer/AppLayerHost.svelte";
</script>

<AppLayer z={1000} layer="floating">
    <AppLayerHost />
</AppLayer>
