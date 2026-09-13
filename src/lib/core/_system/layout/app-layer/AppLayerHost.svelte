<script lang="ts">
    import { layerHostAttach } from "./layer.svelte";
</script>

<div class="pointer-events-none fixed inset-0" {@attach layerHostAttach}></div>
