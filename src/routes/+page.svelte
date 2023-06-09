<script>
	import { enhance } from '$app/forms';
	import { fly, slide } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';

	import config from '../config.js';

	export let data;
	let files;
	// We only want to start showing image after the rest of the page has loaded
	let loading = true;
	let submitting = false;
	let fileInput;

	const authorizedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
	let size = 25;
	let currentPage = 1;

	const imagesPerPage = 25;
	// delay in ms of how long to wait between each fetching of new pics
	const refreshEvery = 10 * 1000;

	function getImagesForPage(all_images, pageNumber) {
		const startIndex = (pageNumber - 1) * imagesPerPage;
		const endIndex = startIndex + imagesPerPage;

		return all_images.slice(startIndex, endIndex);
	}

	$: images = getImagesForPage(data.images, currentPage);
	$: totalPages = Math.ceil(data.images.length / imagesPerPage);

	$: uploadImageAvailable = files && files[0];

	onMount(() => {
		loading = false;

		const interval = setInterval(() => {
			invalidateAll();
		}, refreshEvery);

		return () => {
			clearInterval(interval);
		};
	});

	function jumpPage(page) {
		if (page < 1 || totalPages < page) {
			return;
		}
		currentPage = page;
	}

	function on_key_down(event) {
		if (event.repeat) return;

		switch (event.key) {
			case 'ArrowLeft':
				event.preventDefault();
				jumpPage(currentPage - 1);
				break;

			case 'ArrowRight':
				event.preventDefault();
				jumpPage(currentPage + 1);
				break;
		}
	}
</script>

<svelte:window on:keydown={on_key_down} />
<svelte:body
	on:dragover={(event) => {
		event.preventDefault();
	}}
	on:drop={(event) => {
		event.preventDefault();

		var draggedFiles = event.dataTransfer.files;
		if (draggedFiles.length > 0) {
			fileInput.files = draggedFiles;
			uploadImageAvailable = true;
		}
	}}
/>

<svelte:head>
	<meta property="og:type" value="website" />
	<meta property="og:title" value={config.appName} />
	<meta property="og:description" value="Currently hosting {data.images.length} images" />
</svelte:head>

<body>
	<!-- {#if hoveringWithDrag}
		<div
			class="vh-100 vw-100 bg-primary text-center"
			style="position: fixed; top: 0; left: 0; z-index: 10; opacity: 0.95;"
		>
			<h1 class="text-white display-1 position-absolute top-50 start-50 translate-middle">
				Drop your file here!
			</h1>
		</div>
	{/if} -->
	<!-- Top header -->
	<header class="text-center py-3 mb-3 border-bottom" style="overflow:hidden;">
		<div class="row">
			<!-- User controls -->
			<div class="col ms-3 mt-3">
				<div class="row g-3 align-items-center">
					<div class="col-auto">
						<label for="sizeRange" class="form-label">Size: </label>
					</div>
					<div class="col">
						<input
							id="sizeRange"
							type="range"
							bind:value={size}
							min="10"
							max="50"
							step="0.1"
							class="form-range"
						/>
					</div>
				</div>
			</div>

			<!-- Title -->
			<div class="col text-center">
				<h1 class="m-0">{config.appName}</h1>
				<p class="mb-0"><strong>Currently hosting {data.images.length} images</strong></p>
			</div>

			<div class="col me-3 mt-3">
				<!-- Image upload -->
				{#if config.uploadEnabled}
					<div class="d-flex justify-content-center">
						<form
							method="POST"
							enctype="multipart/form-data"
							action="?/upload"
							use:enhance={() => {
								submitting = true;

								return async ({ update }) => {
									await update();
									//currentPage = 1;
									submitting = false;
								};
							}}
						>
							<!-- <label for="file">Upload your file</label> -->
							<!-- style="display: {imageAvailable ? 'none' : ''};" -->
							<div class="row g-3 align-items-center">
								<!-- <div class="col-auto">
							<label for="file" class="form-label">Upload: </label>
						</div> -->
								<div class="col">
									<input
										bind:this={fileInput}
										bind:files
										type="file"
										id="file"
										name="image"
										accept={authorizedExtensions.join(',')}
										required
										class="form-control"
									/>
								</div>

								<div class="col-auto">
									<button
										type="submit"
										disabled={!uploadImageAvailable || submitting}
										class="btn btn-secondary">{submitting ? 'Uploading...' : 'Upload'}</button
									>
								</div>
							</div>
						</form>
					</div>
				{/if}
			</div>
		</div>
	</header>

	<style>
		li > button {
			/* Disable the ugly focus glow */
			--bs-pagination-focus-box-shadow: 0;
		}
	</style>
	<!-- Pagination buttons -->
	<div>
		<nav>
			<ul class="pagination justify-content-center mb-2">
				<li class="page-item" class:disabled={loading || currentPage <= 1}>
					<button id="btnPreviousPage" class="page-link" on:click={() => jumpPage(currentPage - 1)}
						>Previous</button
					>
				</li>
				<li class="page-item" aria-current="page">
					<p class="page-link mb-0">{currentPage} / {totalPages}</p>
				</li>
				<li class="page-item" class:disabled={loading || currentPage >= totalPages}>
					<button id="btnNextPage" class="page-link" on:click={() => jumpPage(currentPage + 1)}
						>Next</button
					>
				</li>
			</ul>
		</nav>
	</div>

	<style>
		img {
			transition: all 0.2s ease-in-out;
		}
		img:hover {
			transform: scale(1.05);
		}
	</style>
	<!-- Image display -->
	<div
		class="text-center rounded border border-2 border-white mb-2"
		style="margin-left:5%; margin-right:5%"
	>
		{#if loading}
			<p>Loading...</p>
		{:else}
			{#each images as filename (filename)}
				<a href={`${config.uploadFolder}/${filename}`} target="_blank">
					<!-- animate:flip={{ duration: 200 }} -->
					<img
						in:fly|local={{ y: 20 }}
						alt="User-uploaded content"
						src={`${config.uploadFolder}/${filename}`}
						style="max-height: {size}vh; max-width: {size}vh;"
						loading="lazy"
						class="border border-black border-2 m-1"
					/></a
				>
			{:else}
				Nothing there yet!
			{/each}
		{/if}
	</div>
</body>
