export default {
	input: './src/index.js',
	external: ['async_hooks'],
	output: [
		{
			file: 'dist/index.cjs.js',
			format: 'cjs',
			interop: false,
			sourcemap: true,
		},
		{ file: 'dist/index.es.js', format: 'es', sourcemap: true },
	],
}
