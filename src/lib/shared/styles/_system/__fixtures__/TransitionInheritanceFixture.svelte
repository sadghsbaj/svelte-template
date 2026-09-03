<div data-transition-parent class="transition-parent">
    <button data-transition-child class="transition-child">Child</button>
</div>

<button data-transition-independent class="transition-independent"> Independent </button>

<style>
    @property --t-bg {
        syntax: "*";
        inherits: false;
        initial-value: opacity 0s;
    }

    @property --t-scale {
        syntax: "*";
        inherits: false;
        initial-value: opacity 0s;
    }

    @property --t-shadow {
        syntax: "*";
        inherits: false;
        initial-value: opacity 0s;
    }

    @property --t-all {
        syntax: "*";
        inherits: false;
        initial-value: opacity 0s;
    }

    .transition-parent {
        --t-all: all 300ms linear;
        transition: var(--t-all, opacity 0s);
    }

    .transition-child {
        --t-shadow: box-shadow 200ms linear;
        transition:
            var(--t-bg, opacity 0s), var(--t-scale, opacity 0s), var(--t-shadow, opacity 0s),
            var(--t-all, opacity 0s);
    }

    .transition-independent {
        --t-bg: background-color 700ms linear;
        --t-scale: scale 20000ms linear;
        transition: var(--t-bg, opacity 0s), var(--t-scale, opacity 0s);
    }
</style>
