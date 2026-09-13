<script lang="ts">
    import AppLayer from "$core/_system/layout/app-layer/AppLayer.svelte";
    import FocusHost from "$core/_system/focus/FocusHost.svelte";
</script>

<AppLayer z={1000} layer="system">
    <FocusHost />
</AppLayer>
