// js/OBJLoader.js - VERSION CORRIGÉE

// La ligne ci-dessous a été modifiée pour utiliser un chemin relatif que le navigateur comprend.
import * as THREE from './three.module.js';

class OBJLoader extends THREE.Loader {

	constructor( manager ) {

		super( manager );

	}

	load( url, onLoad, onProgress, onError ) {

		const scope = this;

		const loader = new THREE.FileLoader( this.manager );
		loader.setPath( this.path );
		loader.setRequestHeader( this.requestHeader );
		loader.setWithCredentials( this.withCredentials );
		loader.load( url, function ( text ) {

			try {

				onLoad( scope.parse( text ) );

			} catch ( e ) {

				if ( onError ) {

					onError( e );

				} else {

					console.error( e );

				}

				scope.manager.itemError( url );

			}

		}, onProgress, onError );

	}

	parse( text ) {

		const state = {
			objects: [],
			object: {},

			vertices: [],
			normals: [],
			colors: [],
			uvs: [],

			materials: {},
			materialLibraries: [],

			startObject: function ( name, fromDeclaration ) {

				if ( this.object && this.object.fromDeclaration === false ) {

					this.object.name = name;
					this.object.fromDeclaration = ( fromDeclaration !== false );
					return;

				}

				if ( this.object && typeof this.object.currentMaterial === 'function' ) {

					this.object.currentMaterial( { type: 'default' } );

				}



				this.object = {
					name: name || '',
					fromDeclaration: ( fromDeclaration !== false ),

					geometry: {
						vertices: [],
						normals: [],
						colors: [],
						uvs: [],
						hasUVIndices: false
					},
					materials: [],
					smooth: true,

					startMaterial: function ( name, libraries ) {

						const previous = this._finalize( false );

						// New usemtl declaration parsing
						if ( previous && ( previous.inherited || previous.groupCount <= 0 ) ) {

							this.materials.splice( previous.index, 1 );

						}

						const material = {
							index: this.materials.length,
							name: name || '',
							mtllib: Array.isArray( libraries ) && libraries.length > 0 ? libraries[ libraries.length - 1 ] : '',
							smooth: ( previous !== undefined ? previous.smooth : this.smooth ),
							groupStart: ( previous !== undefined ? previous.groupEnd : 0 ),
							groupEnd: - 1,
							groupCount: - 1,
							inherited: false,

							clone: function ( index ) {

								const cloned = {
									index: ( typeof index === 'number' ? index : this.index ),
									name: this.name,
									mtllib: this.mtllib,
									smooth: this.smooth,
									groupStart: 0,
									groupEnd: - 1,
									groupCount: - 1,
									inherited: false
								};
								cloned.clone = this.clone.bind( cloned );
								return cloned;

							}
						};

						this.materials.push( material );

						return material;

					},

					currentMaterial: function () {

						if ( this.materials.length > 0 ) {

							return this.materials[ this.materials.length - 1 ];

						}

						return undefined;

					},

					_finalize: function ( end ) {

						const lastMultiMaterial = this.currentMaterial();
						if ( lastMultiMaterial && lastMultiMaterial.groupEnd === - 1 ) {

							lastMultiMaterial.groupEnd = this.geometry.vertices.length / 3;
							lastMultiMaterial.groupCount = lastMultiMaterial.groupEnd - lastMultiMaterial.groupStart;
							lastMultiMaterial.inherited = false;

						}

						// Ignore objects with no vertices
						if ( end && this.geometry.vertices.length === 0 ) {

							this.objects.push( this.object );

						}


						return lastMultiMaterial;

					}
				};

				// Inherit previous objects material.
				// Spec deviation allows second material information to be defined on the same line as the object definition.
				if ( this.object && typeof this.object.currentMaterial === 'function' ) {

					const previousMaterial = this.object.currentMaterial();

					if ( previousMaterial && previousMaterial.name && previousMaterial.name.length > 0 ) {

						const material = previousMaterial.clone( 0 );
						material.inherited = true;
						this.object.materials.push( material );

					}

				}

				this.objects.push( this.object );

			},

			finalize: function () {

				if ( this.object && typeof this.object._finalize === 'function' ) {

					this.object._finalize( true );

				}

			},

			parseVertexIndex: function ( value ) {

				const index = parseInt( value, 10 );
				return ( index >= 0 ? index - 1 : index + this.vertices.length / 3 );

			},

			parseNormalIndex: function ( value ) {

				const index = parseInt( value, 10 );
				return ( index >= 0 ? index - 1 : index + this.normals.length / 3 );

			},

			parseUVIndex: function ( value ) {

				const index = parseInt( value, 10 );
				return ( index >= 0 ? index - 1 : index + this.uvs.length / 2 );

			},

			addVertex: function ( a, b, c ) {

				const src = this.vertices;
				const dst = this.object.geometry.vertices;

				dst.push( src[ a + 0 ], src[ a + 1 ], src[ a + 2 ] );
				dst.push( src[ b + 0 ], src[ b + 1 ], src[ b + 2 ] );
				dst.push( src[ c + 0 ], src[ c + 1 ], src[ c + 2 ] );

			},

			addVertexPoint: function ( a ) {

				const src = this.vertices;
				const dst = this.object.geometry.vertices;

				dst.push( src[ a + 0 ], src[ a + 1 ], src[ a + 2 ] );

			},

			addVertexLine: function ( a ) {

				const src = this.vertices;
				const dst = this.object.geometry.vertices;

				dst.push( src[ a + 0 ], src[ a + 1 ], src[ a + 2 ] );

			},

			addNormal: function ( a, b, c ) {

				const src = this.normals;
				const dst = this.object.geometry.normals;

				dst.push( src[ a + 0 ], src[ a + 1 ], src[ a + 2 ] );
				dst.push( src[ b + 0 ], src[ b + 1 ], src[ b + 2 ] );
				dst.push( src[ c + 0 ], src[ c + 1 ], src[ c + 2 ] );

			},

			addFaceNormal: function ( a, b, c ) {

				const src = this.vertices;
				const dst = this.object.geometry.normals;

				const vA = new THREE.Vector3();
				const vB = new THREE.Vector3();
				const vC = new THREE.Vector3();

				vA.fromArray( src, a );
				vB.fromArray( src, b );
				vC.fromArray( src, c );

				const cb = new THREE.Vector3();
				const ab = new THREE.Vector3();

				cb.subVectors( vC, vB );
				ab.subVectors( vA, vB );
				cb.cross( ab );

				cb.normalize();

				dst.push( cb.x, cb.y, cb.z );
				dst.push( cb.x, cb.y, cb.z );
				dst.push( cb.x, cb.y, cb.z );

			},

			addColor: function ( a, b, c ) {

				const src = this.colors;
				const dst = this.object.geometry.colors;

				if ( src[ a ] !== undefined ) dst.push( src[ a + 0 ], src[ a + 1 ], src[ a + 2 ] );
				if ( src[ b ] !== undefined ) dst.push( src[ b + 0 ], src[ b + 1 ], src[ b + 2 ] );
				if ( src[ c ] !== undefined ) dst.push( src[ c + 0 ], src[ c + 1 ], src[ c + 2 ] );

			},

			addUV: function ( a, b, c ) {

				const src = this.uvs;
				const dst = this.object.geometry.uvs;

				dst.push( src[ a + 0 ], src[ a + 1 ] );
				dst.push( src[ b + 0 ], src[ b + 1 ] );
				dst.push( src[ c + 0 ], src[ c + 1 ] );

			},

			addUVLine: function ( a ) {

				const src = this.uvs;
				const dst = this.object.geometry.uvs;

				dst.push( src[ a + 0 ], src[ a + 1 ] );

			},

			addFace: function ( a, b, c, ua, ub, uc, na, nb, nc ) {

				const vLen = this.vertices.length;

				let ia = this.parseVertexIndex( a );
				let ib = this.parseVertexIndex( b );
				let ic = this.parseVertexIndex( c );

				if ( ia < 0 || ia >= vLen / 3 || ib < 0 || ib >= vLen / 3 || ic < 0 || ic >= vLen / 3 ) {

					// ignore invalid face
					return;

				}

				this.addVertex( ia * 3, ib * 3, ic * 3 );
				this.addColor( ia * 3, ib * 3, ic * 3 );

				if ( ua !== undefined && ua !== '' ) {

					const uvLen = this.uvs.length;
					ia = this.parseUVIndex( ua );
					ib = this.parseUVIndex( ub );
					ic = this.parseUVIndex( uc );

					if ( ia < 0 || ia >= uvLen / 2 || ib < 0 || ib >= uvLen / 2 || ic < 0 || ic >= uvLen / 2 ) {

						// ignore invalid face
						return;

					}

					this.addUV( ia * 2, ib * 2, ic * 2 );
					this.object.geometry.hasUVIndices = true;

				}

				if ( na !== undefined && na !== '' ) {

					// Normals are many times the same. If so, skip function call and parseInt.
					const nLen = this.normals.length;
					ia = this.parseNormalIndex( na );

					const naSame = ( na === nb && na === nc );
					if ( ia < 0 || ia >= nLen / 3 ) {

						// ignore invalid face
						return;

					}


					if ( naSame ) {

						const n = this.normals;
						const geo_n = this.object.geometry.normals;
						geo_n.push( n[ ia * 3 + 0 ], n[ ia * 3 + 1 ], n[ ia * 3 + 2 ] );
						geo_n.push( n[ ia * 3 + 0 ], n[ ia * 3 + 1 ], n[ ia * 3 + 2 ] );
						geo_n.push( n[ ia * 3 + 0 ], n[ ia * 3 + 1 ], n[ ia * 3 + 2 ] );

					} else {

						ib = this.parseNormalIndex( nb );
						ic = this.parseNormalIndex( nc );

						if ( ib < 0 || ib >= nLen / 3 || ic < 0 || ic >= nLen / 3 ) {

							// ignore invalid face
							return;

						}

						this.addNormal( ia * 3, ib * 3, ic * 3 );

					}

				} else {

					this.addFaceNormal( ia * 3, ib * 3, ic * 3 );

				}

			},

			addPointGeometry: function ( vertices ) {

				this.object.geometry.type = 'Points';

				const vLen = this.vertices.length;

				for ( let vi = 0, l = vertices.length; vi < l; vi ++ ) {

					const index = this.parseVertexIndex( vertices[ vi ] );

					if ( index < 0 || index >= vLen / 3 ) {

						// ignore invalid point
						continue;

					}

					this.addVertexPoint( index * 3 );
					this.addColor( index * 3 );

				}

			},

			addLineGeometry: function ( vertices, uvs ) {

				this.object.geometry.type = 'Line';

				const vLen = this.vertices.length;
				const uvLen = this.uvs.length;

				for ( let vi = 0, l = vertices.length; vi < l; vi ++ ) {

					const index = this.parseVertexIndex( vertices[ vi ] );

					if ( index < 0 || index >= vLen / 3 ) {

						// ignore invalid line
						continue;

					}

					this.addVertexLine( index * 3 );

				}

				if ( uvs !== undefined && uvs.length > 0 ) {

					for ( let uvi = 0, l = uvs.length; uvi < l; uvi ++ ) {

						const index = this.parseUVIndex( uvs[ uvi ] );

						if ( index < 0 || index >= uvLen / 2 ) {

							// ignore invalid line
							continue;

						}


						this.addUVLine( index * 2 );

					}

				}

			}

		};

		state.startObject( '', false );

		// v float float float
		const vertex_pattern = /v\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)/;

		// vn float float float
		const normal_pattern = /vn\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)/;

		// vt float float
		const uv_pattern = /vt\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)/;

		// f vertex vertex vertex
		const face_pattern1 = /f\s+(-?\d+)\s+(-?\d+)\s+(-?\d+)(?:\s+(-?\d+))?/;

		// f vertex/uv vertex/uv vertex/uv
		const face_pattern2 = /f\s+(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)(?:\s+(-?\d+)\/(-?\d+))?/;

		// f vertex/uv/normal vertex/uv/normal vertex/uv/normal
		const face_pattern3 = /f\s+(-?\d+)\/(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\/(-?\d+)(?:\s+(-?\d+)\/(-?\d+)\/(-?\d+))?/;

		// f vertex//normal vertex//normal vertex//normal
		const face_pattern4 = /f\s+(-?\d+)\/\/(-?\d+)\s+(-?\d+)\/\/(-?\d+)\s+(-?\d+)\/\/(-?\d+)(?:\s+(-?\d+)\/\/(-?\d+))?/;

		// o object_name | g group_name
		const object_pattern = /^[og]\s*(.+)?/;

		// s boolean
		const smoothing_pattern = /s\s+(on|off|[\d\.]+)/;

		// mtllib file_reference
		const material_library_pattern = /mtllib /;

		// usemtl material_name
		const material_use_pattern = /usemtl /;

		// p vertex ...
		const point_pattern = /p\s+((?:-?\d+\s*)+)/;

		// l vertex/uv ...
		const line_pattern = /l\s+((?:-?\d+(?:\/-?\d+)?\s*)+)/;

		const terminators = [ '\r\n', '\n' ];
		let terminator = terminators[ 0 ];

		// Some formats use different terminators. If we find terminator 2 patterns, switch to that.
		if ( text.indexOf( terminators[ 1 ] ) > - 1 ) {

			terminator = terminators[ 1 ];

		}

		const lines = text.split( terminator );
		let result;

		for ( let i = 0, l = lines.length; i < l; i ++ ) {

			const line = lines[ i ].trim();

			if ( line.length === 0 ) continue;

			if ( ( result = vertex_pattern.exec( line ) ) !== null ) {

				// ["v 1.0 2.0 3.0", "1.0", "2.0", "3.0"]

				state.vertices.push(
					parseFloat( result[ 1 ] ),
					parseFloat( result[ 2 ] ),
					parseFloat( result[ 3 ] )
				);

			} else if ( ( result = normal_pattern.exec( line ) ) !== null ) {

				// ["vn 1.0 2.0 3.0", "1.0", "2.0", "3.0"]

				state.normals.push(
					parseFloat( result[ 1 ] ),
					parseFloat( result[ 2 ] ),
					parseFloat( result[ 3 ] )
				);

			} else if ( ( result = uv_pattern.exec( line ) ) !== null ) {

				// ["vt 0.1 0.2", "0.1", "0.2"]

				state.uvs.push(
					parseFloat( result[ 1 ] ),
					parseFloat( result[ 2 ] )
				);

			} else if ( ( result = face_pattern1.exec( line ) ) !== null ) {

				// ["f 1 2 3", "1", "2", "3", undefined]

				state.addFace(
					result[ 1 ], result[ 2 ], result[ 3 ],
					null, null, null,
					null, null, null
				);

				if ( result[ 4 ] !== undefined ) {

					state.addFace(
						result[ 1 ], result[ 3 ], result[ 4 ],
						null, null, null,
						null, null, null
					);

				}


			} else if ( ( result = face_pattern2.exec( line ) ) !== null ) {

				// ["f 1/1 2/2 3/3", "1", "1", "2", "2", "3", "3", undefined, undefined]

				state.addFace(
					result[ 1 ], result[ 3 ], result[ 5 ],
					result[ 2 ], result[ 4 ], result[ 6 ],
					null, null, null
				);

				if ( result[ 7 ] !== undefined ) {

					state.addFace(
						result[ 1 ], result[ 5 ], result[ 7 ],
						result[ 2 ], result[ 6 ], result[ 8 ],
						null, null, null
					);

				}

			} else if ( ( result = face_pattern3.exec( line ) ) !== null ) {

				// ["f 1/1/1 2/2/2 3/3/3", "1", "1", "1", "2", "2", "2", "3", "3", "3", undefined, undefined, undefined]

				state.addFace(
					result[ 1 ], result[ 4 ], result[ 7 ],
					result[ 2 ], result[ 5 ], result[ 8 ],
					result[ 3 ], result[ 6 ], result[ 9 ]
				);

				if ( result[ 10 ] !== undefined ) {

					state.addFace(
						result[ 1 ], result[ 7 ], result[ 10 ],
						result[ 2 ], result[ 8 ], result[ 11 ],
						result[ 3 ], result[ 9 ], result[ 12 ]
					);

				}

			} else if ( ( result = face_pattern4.exec( line ) ) !== null ) {

				// ["f 1//1 2//2 3//3", "1", "1", "2", "2", "3", "3", undefined, undefined]

				state.addFace(
					result[ 1 ], result[ 3 ], result[ 5 ],
					null, null, null,
					result[ 2 ], result[ 4 ], result[ 6 ]
				);

				if ( result[ 7 ] !== undefined ) {

					state.addFace(
						result[ 1 ], result[ 5 ], result[ 7 ],
						null, null, null,
						result[ 2 ], result[ 6 ], result[ 8 ]
					);

				}

			} else if ( ( result = point_pattern.exec( line ) ) !== null ) {

				const Gidx = result[ 1 ].trim().split( /\s+/ );
				state.addPointGeometry( Gidx );


			} else if ( ( result = line_pattern.exec( line ) ) !== null ) {

				const Gidx = result[ 1 ].trim().split( /\s+/ );
				const Vidx = [];
				const Uidx = [];

				Gidx.forEach( ( g ) => {

					const Vi = g.split( '/' );
					Vidx.push( Vi[ 0 ] );
					if ( Vi.length > 1 ) {

						Uidx.push( Vi[ 1 ] );

					}

				} );

				state.addLineGeometry( Vidx, Uidx );

			} else if ( ( result = object_pattern.exec( line ) ) !== null ) {

				const name = result[ 1 ] ? result[ 1 ].trim() : true;

				state.startObject( name );

			} else if ( material_library_pattern.test( line ) ) {

				state.materialLibraries.push( line.substring( 7 ).trim() );

			} else if ( material_use_pattern.test( line ) ) {

				state.object.startMaterial( line.substring( 7 ).trim(), state.materialLibraries );

			} else if ( ( result = smoothing_pattern.exec( line ) ) !== null ) {

				// smooth shading

				// @TODO waiting for some solid requirements
				// s off
				// s smooth
				// s 1

				const value = result[ 1 ].trim().toLowerCase();
				state.object.smooth = ( value === 'on' || value === '1' );

			} else {

				// Handle null terminated files without exception
				if ( line === '\0' ) continue;

				console.warn( 'THREE.OBJLoader: Unhandled line ' + i + ': ' + line );

			}

		}

		state.finalize();

		const container = new THREE.Group();
		container.materialLibraries = [].concat( state.materialLibraries );

		for ( let i = 0, l = state.objects.length; i < l; i ++ ) {

			const object = state.objects[ i ];
			const geometry = object.geometry;
			const materials = object.materials;
			const isLine = ( geometry.type === 'Line' );
			const isPoints = ( geometry.type === 'Points' );
			let hasVertexColors = false;

			// Skip o/g line declarations that did not follow with any faces
			if ( geometry.vertices.length === 0 ) continue;

			const buffergeometry = new THREE.BufferGeometry();

			buffergeometry.setAttribute( 'position', new THREE.Float32BufferAttribute( geometry.vertices, 3 ) );

			if ( geometry.normals.length > 0 ) {

				buffergeometry.setAttribute( 'normal', new THREE.Float32BufferAttribute( geometry.normals, 3 ) );

			}

			if ( geometry.colors.length > 0 ) {

				hasVertexColors = true;
				buffergeometry.setAttribute( 'color', new THREE.Float32BufferAttribute( geometry.colors, 3 ) );

			}

			if ( geometry.hasUVIndices === true ) {

				buffergeometry.setAttribute( 'uv', new THREE.Float32BufferAttribute( geometry.uvs, 2 ) );

			}

			// Create materials

			const createdMaterials = [];

			for ( let mi = 0, miLen = materials.length; mi < miLen; mi ++ ) {

				const sourceMaterial = materials[ mi ];
				const materialHash = sourceMaterial.name + '_' + sourceMaterial.smooth + '_' + hasVertexColors;
				let material = state.materials[ materialHash ];

				if ( material === undefined ) {

					const materialParams = {
						name: sourceMaterial.name,
						side: THREE.FrontSide
					};

					if ( isLine ) {

						material = new THREE.LineBasicMaterial( materialParams );

					} else if ( isPoints ) {

						material = new THREE.PointsMaterial( { ...materialParams, size: 1, sizeAttenuation: false } );

					} else {

						material = new THREE.MeshPhongMaterial( materialParams );

					}

					material.name = sourceMaterial.name;
					material.flatShading = sourceMaterial.smooth ? false : true;
					material.vertexColors = hasVertexColors;

					state.materials[ materialHash ] = material;

				}


				createdMaterials.push( material );

			}

			// Create mesh

			let mesh;

			if ( createdMaterials.length > 1 ) {

				for ( let mi = 0, miLen = materials.length; mi < miLen; mi ++ ) {

					const sourceMaterial = materials[ mi ];
					buffergeometry.addGroup( sourceMaterial.groupStart, sourceMaterial.groupCount, mi );

				}

				if ( isLine ) {

					mesh = new THREE.LineSegments( buffergeometry, createdMaterials );

				} else if ( isPoints ) {

					mesh = new THREE.Points( buffergeometry, createdMaterials );

				} else {

					mesh = new THREE.Mesh( buffergeometry, createdMaterials );

				}

			} else {

				if ( isLine ) {

					mesh = new THREE.LineSegments( buffergeometry, createdMaterials[ 0 ] );

				} else if ( isPoints ) {

					mesh = new THREE.Points( buffergeometry, createdMaterials[ 0 ] );

				} else {

					mesh = new THREE.Mesh( buffergeometry, createdMaterials[ 0 ] );

				}

			}

			mesh.name = object.name;

			container.add( mesh );

		}

		return container;

	}

}

export { OBJLoader };