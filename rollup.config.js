export default {
	entry: './src/index.js',
	external: ['async_hooks'],
	interop: false,
	sourceMap: true,
	targets: [
		{ dest: './dist/index.cjs.js', format: 'cjs' },
		{ dest: './dist/index.es.js', format: 'es' },
	],
}
