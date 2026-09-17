<script lang="ts">
    import FocusHost from "$core/_system/focus/FocusHost.svelte";
    import AppLayer from "$core/_system/layout/app-layer/AppLayer.svelte";
</script>

<AppLayer z={1000} layer="system">
    <FocusHost />
</AppLayer>
