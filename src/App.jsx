import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './App.css';
import pinRed from './assets/images/pin-red.png';
import pinGreen from './assets/images/pin-green.png';
import logo from './assets/images/logo.png';
import qrcode from './assets/images/qrcode.png';
import qrbutton from './assets/images/qrbutton.png';

const ROUNDS = [
	{
		embed: 'https://schools.360cities.net/image/embed/xj5P924JH77Gm-_TzpvGMA',
		lat: 40.7576,
		lng: -73.985881,
		label: 'Times Square, New York, America',
	},
	{
		embed: 'https://schools.360cities.net/image/embed/WtXQtfl3z1xOquFIKZxRKg',
		lat: 51.51274803826184,
		lng: -0.08351298054934982,
		label: 'Leadenhall Market, London, The UK',
	},
	{
		embed: 'https://schools.360cities.net/image/embed/KfS7hpIbhzHGhuloCpDLBw',
		lat: -33.85777946653259,
		lng: 151.21427994751795,
		label: 'Sydney Opera House, Sydney, Australia',
	},
];

const USER_MARKER = new L.Icon({
	iconUrl: pinRed,
	iconSize: [32, 32],
	iconAnchor: [16, 32],
	popupAnchor: [1, -34],
	shadowUrl: undefined,
	shadowSize: undefined,
});
const GREEN_MARKER = new L.Icon({
	iconUrl: pinGreen,
	iconSize: [32, 32],
	iconAnchor: [16, 32],
	popupAnchor: [1, -34],
	shadowUrl: undefined,
	shadowSize: undefined,
});

function LocationPicker({ onPick, disabled }) {
	useMapEvents({
		click(e) {
			if (!disabled && typeof onPick === 'function') {
				onPick([e.latlng.lat, e.latlng.lng]);
			}
		},
	});
	return null;
}

function App() {
	const [current, setCurrent] = useState(0);
	const [guessLatLng, setGuessLatLng] = useState(null);
	const [showResult, setShowResult] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);
	const [answers, setAnswers] = useState([]);
	const [score, setScore] = useState(0);
	const [bestScore, setBestScore] = useState(() => Number(localStorage.getItem('bestScore')) || 0);
	const [finished, setFinished] = useState(false);
	const [mapExpanded, setMapExpanded] = useState(false);
	const [showQRCode, setShowQRCode] = useState(false);

	function handleGuess() {
		setShowConfirm(true);
	}

	function handleConfirm() {
		const correct = [ROUNDS[current].lat, ROUNDS[current].lng];
		const guess = guessLatLng;
		const dist = getDistanceKm(guess, correct);
		const points = Math.max(0, Math.round(5000 - dist * 25));
		const newAnswers = [...answers, { guess, correct, dist, points }];
		setAnswers(newAnswers);
		setScore((s) => s + points);
		setShowConfirm(false);
		setShowResult(true);
	}

	function handleNext() {
		setShowResult(false);
		setGuessLatLng(null);
		if (current + 1 < ROUNDS.length) {
			setCurrent((c) => c + 1);
		} else {
			if (score > bestScore) {
				setBestScore(score);
				localStorage.setItem('bestScore', score);
			}
			setFinished(true);
		}
	}

	function handleRestart() {
		setCurrent(0);
		setGuessLatLng(null);
		setShowResult(false);
		setShowConfirm(false);
		setAnswers([]);
		setScore(0);
		setFinished(false);
	}

	function getDistanceKm(a, b) {
		const toRad = (v) => (v * Math.PI) / 180;
		const R = 6371;
		const dLat = toRad(b[0] - a[0]);
		const dLng = toRad(b[1] - a[1]);
		const lat1 = toRad(a[0]);
		const lat2 = toRad(b[0]);
		const h =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
		return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
	}

	return (
		<div className="container" style={{ position: 'fixed', inset: 0, minHeight: '100vh', width: '100vw', padding: 0, margin: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
			<div style={{ margin: 0, textAlign: 'center', flex: '0 0 auto', padding: '8px 0' }}>
				<img src={logo} alt="Globe Guesser" style={{ height: 'clamp(40px,4vw,80px)', maxWidth: '100%' }} />
			</div>
			{!finished ? (
				<div
					className="game-area"
					style={{
						display: 'flex',
						flexDirection: 'row',
						alignItems: 'stretch',
						justifyContent: 'stretch',
						gap: 0,
						flex: '1 1 0',
						width: '100vw',
						height: '100%',
						minHeight: 0,
						maxHeight: '100%',
						margin: 0,
						padding: 0,
						boxSizing: 'border-box',
					}}
				>
					<div
						className="streetview-embed"
						style={{
							flex: 1,
							minWidth: 0,
							margin: 0,
							height: '100%',
							borderRadius: 0,
							overflow: 'hidden',
							background: '#eee',
							boxSizing: 'border-box',
						}}
					>
						<iframe
							width="100%"
							height="100%"
							src={ROUNDS[current].embed}
							frameBorder="0"
							allow="accelerometer; gyroscope"
							allowFullScreen
							title="Street View"
							style={{ display: 'block', width: '100%', height: '100%' }}
						/>
					</div>
					<div
						className="input-area"
						style={{
							flex: 1,
							minWidth: 0,
							margin: 0,
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: 'center',
							height: '100%',
							boxSizing: 'border-box',
						}}
					>
						<div
							style={{
								position: 'relative',
								width: '100%',
								height: '100%',
								margin: 0,
								transition: 'all 0.3s',
								borderRadius: 0,
								minHeight: 0,
								boxSizing: 'border-box',
							}}
						>
							<MapContainer
								center={[20, 0]}
								zoom={mapExpanded ? 2 : 1}
								key={mapExpanded ? 'expanded' : 'normal'}
								style={{
									height: '100%',
									width: '100%',
									borderRadius: 0,
									boxShadow: '0 2px 8px #0002',
									boxSizing: 'border-box',
								}}
								attributionControl={false}
								maxBounds={[[-85, -180], [85, 180]]}
								maxBoundsViscosity={1.0}
								minZoom={1}
								maxZoom={10}
							>
								<TileLayer 
									url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
									noWrap={true}
									bounds={[[-85, -180], [85, 180]]}
								/>
								<LocationPicker onPick={!showResult && !showConfirm ? setGuessLatLng : undefined} disabled={showResult || showConfirm} />
								{guessLatLng && <Marker position={guessLatLng} icon={USER_MARKER} />}
							</MapContainer>
							<button
								style={{
									position: 'absolute',
									top: 8,
									right: 8,
									zIndex: 10,
									fontSize: 12,
									padding: '0.2em 0.7em',
									borderRadius: 6,
									background: '#fff',
									border: '1px solid #ccc',
									cursor: 'pointer',
								}}
								onClick={() => setMapExpanded((e) => !e)}
							>
								{mapExpanded ? '小さく' : '拡大'}
							</button>
						</div>
						<button
							onClick={handleGuess}
							disabled={!guessLatLng}
							style={{
								marginTop: '2vh',
								fontSize: 'clamp(16px,1.5vw,28px)',
								padding: '0.5em 2em',
								borderRadius: 8,
								background: '#81c784',
								color: '#fff',
								border: 'none',
								cursor: 'pointer',
								width: '100%',
							}}
						>
							こたえる
						</button>
					</div>
				</div>
			) : (
				<div className="result-area">
					<h2>
						おわり！スコア: {score} / {ROUNDS.length * 5000}
					</h2>
					<ul>
						{answers.map((a, i) => (
							<li key={i}>
								{i + 1}. 距離: {a.dist.toFixed(1)}km 得点: {a.points}
							</li>
						))}
					</ul>
					<button onClick={handleRestart}>リスタート</button>
				</div>
			)}
			{showResult && (
				<div className="modal">
					<div className="modal-content" style={{ width: 1100, maxWidth: '99vw', padding: 0, overflow: 'hidden', background: '#fff', maxHeight: '90vh', display: 'flex', flexDirection: 'row', alignItems: 'stretch', justifyContent: 'center' }}>
						<div style={{ flex: 1.5, minWidth: 600, maxWidth: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eee', height: '100%' }}>
							<ResultMap guess={answers[answers.length - 1]?.guess} correct={answers[answers.length - 1]?.correct} />
						</div>
						<div style={{ flex: 1, minWidth: 320, maxWidth: 400, padding: '2.5em 2em', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#fff', height: '100%' }}>
							<h2 style={{ margin: 0, fontSize: 28, color: '#388e3c' }}>結果</h2>
							<div style={{ fontSize: 22, margin: '32px 0 0 0', color: '#333', textAlign: 'center' }}>
								正解: {ROUNDS[answers.length - 1].label}<br />
								距離: <span style={{ color: '#d32f2f', fontWeight: 600 }}>{answers[answers.length - 1]?.dist.toFixed(1)} km</span><br />
								このラウンドの得点: <span style={{ color: '#388e3c', fontWeight: 600 }}>{answers[answers.length - 1]?.points}</span>
							</div>
							<button onClick={handleNext} style={{ fontSize: 18, padding: '0.7em 2.5em', borderRadius: 8, background: '#388e3c', color: '#fff', border: 'none', cursor: 'pointer', margin: '32px 0 0 0' }}>つぎへ</button>
						</div>
					</div>
				</div>
			)}
			{showConfirm && guessLatLng && (
	<div className="modal">
		<div className="modal-content" style={{ width: 900, maxWidth: '99vw', padding: 0, overflow: 'hidden', background: '#fff', maxHeight: '90vh', display: 'flex', flexDirection: 'row', alignItems: 'stretch', justifyContent: 'center' }}>
			<div style={{ flex: 1.5, minWidth: 600, maxWidth: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eee', height: '100%' }}>
				<MapContainer
					center={guessLatLng}
					zoom={2}
					style={{ height: 520, width: 880 }}
					attributionControl={false}
					maxBounds={[[-85, -180], [85, 180]]}
					maxBoundsViscosity={1.0}
				>
					<TileLayer 
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
						noWrap={true}
						bounds={[[-85, -180], [85, 180]]}
					/>
					<Marker position={guessLatLng} icon={USER_MARKER} />
				</MapContainer>
			</div>
			<div style={{ flex: 1, minWidth: 320, maxWidth: 400, padding: '2.5em 2em', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#fff', height: '100%' }}>
				<h2 style={{ margin: 0, fontSize: 28, color: '#388e3c' }}>確認</h2>
				<div style={{ fontSize: 22, marginBottom: 24, color: '#333', textAlign: 'center' }}>この場所で確定しますか？</div>
				<div style={{ textAlign: 'center', marginBottom: 24 }}>
					<button onClick={handleConfirm} style={{ fontSize: 18, padding: '0.7em 2.5em', borderRadius: 8, background: '#388e3c', color: '#fff', border: 'none', cursor: 'pointer', marginRight: 12 }}>確定</button>
					<button onClick={() => setShowConfirm(false)} style={{ fontSize: 16, padding: '0.7em 2em', borderRadius: 8, background: '#ccc', color: '#333', border: 'none', cursor: 'pointer' }}>キャンセル</button>
				</div>
			</div>
		</div>
	</div>
)}
			<div className="score-area">
				さいこうスコア: {bestScore}
			</div>
			<button
				onClick={() => setShowQRCode(true)}
				style={{
					position: 'fixed',
					bottom: '20px',
					right: '20px',
					width: '50px',
					height: '50px',
					background: 'transparent',
					border: 'none',
					cursor: 'pointer',
					boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
					zIndex: 1000,
					padding: 0,
					borderRadius: '4px',
					overflow: 'hidden'
				}}
				title="QRコードを表示"
			>
				<img 
					src={qrbutton} 
					alt="QR Code" 
					style={{ 
						width: '100%', 
						height: '100%',
						objectFit: 'cover'
					}} 
				/>
			</button>
			{showQRCode && (
				<div 
					className="modal"
					style={{
						background: 'rgba(0,0,0,0.8)',
						zIndex: 2000
					}}
					onClick={() => setShowQRCode(false)}
				>
					<div 
						className="modal-content" 
						style={{
							width: 'auto',
							maxWidth: '90vw',
							maxHeight: '90vh',
							padding: '20px',
							background: '#fff',
							borderRadius: '12px',
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: 'center'
						}}
						onClick={(e) => e.stopPropagation()}
					>
						<h2 style={{ margin: '0 0 20px 0', color: '#333' }}>QRコード</h2>
						<img 
							src={qrcode} 
							alt="QR Code" 
							style={{ 
								maxWidth: '100%', 
								maxHeight: '70vh',
								borderRadius: '8px'
							}} 
						/>
						<button
							onClick={() => setShowQRCode(false)}
							style={{
								marginTop: '20px',
								padding: '10px 20px',
								background: '#388e3c',
								color: '#fff',
								border: 'none',
								borderRadius: '6px',
								cursor: 'pointer',
								fontSize: '16px'
							}}
						>
							閉じる
						</button>
					</div>
				</div>
			)}
			<footer>360cities画像を使用 | © 2025</footer>
		</div>
	);
}

function MapController({ guess, correct }) {
	const map = useMapEvents({});
	
	// Normalize longitude to [-180, 180] range
	const normalizeLng = (lng) => {
		let normalized = ((lng + 180) % 360) - 180;
		if (normalized < -180) normalized += 360;
		return normalized;
	};

	useEffect(() => {
		if (map && guess && correct) {
			// Wait for map to be ready
			setTimeout(() => {
				const [lat1, lng1] = guess;
				const [lat2, lng2] = correct;
				
				// Normalize coordinates
				const normalizedGuess = [lat1, normalizeLng(lng1)];
				const normalizedCorrect = [lat2, normalizeLng(lng2)];
				
				// Calculate the actual distance using the same formula as the game
				const toRad = (v) => (v * Math.PI) / 180;
				const R = 6371;
				const dLat = toRad(lat2 - lat1);
				const dLng = toRad(normalizeLng(lng2) - normalizeLng(lng1));
				const lat1Rad = toRad(lat1);
				const lat2Rad = toRad(lat2);
				const h =
					Math.sin(dLat / 2) * Math.sin(dLat / 2) +
					Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
				const distance = 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
				
				// Create bounds that include both normalized points
				const bounds = L.latLngBounds([normalizedGuess, normalizedCorrect]);
				
				// Determine appropriate zoom and padding based on actual distance
				let maxZoom, padding;
				if (distance < 1) {
					// Very close points (< 1km) - zoom in a lot
					maxZoom = 16;
					padding = 1.5;
				} else if (distance < 10) {
					// Close points (< 10km) - zoom in quite a bit
					maxZoom = 14;
					padding = 1.0;
				} else if (distance < 100) {
					// Nearby points (< 100km) - moderate zoom
					maxZoom = 11;
					padding = 0.8;
				} else if (distance < 1000) {
					// Medium distance (< 1000km) - some zoom
					maxZoom = 8;
					padding = 0.5;
				} else if (distance < 5000) {
					// Long distance (< 5000km) - less zoom
					maxZoom = 6;
					padding = 0.3;
				} else {
					// Very long distance (> 5000km) - minimal zoom
					maxZoom = 4;
					padding = 0.2;
				}
				
				// Add padding and fit bounds
				try {
					map.fitBounds(bounds.pad(padding), {
						maxZoom: maxZoom,
						animate: false
					});
				} catch (error) {
					console.error('Error fitting bounds:', error);
					// Fallback to manual zoom calculation
					const center = bounds.getCenter();
					map.setView(center, Math.min(maxZoom, 3), { animate: false });
				}
			}, 100);
		}
	}, [map, guess, correct]);

	return null;
}

function ResultMap({ guess, correct }) {
	// Calculate the shortest path that stays within map bounds
	const getShortestPath = (point1, point2) => {
		const [lat1, rawLng1] = point1;
		const [lat2, rawLng2] = point2;
		
		const normalizeLng = (lng) => {
			let normalized = ((lng + 180) % 360) - 180;
			if (normalized < -180) normalized += 360;
			return normalized;
		};
		
		const lng1 = normalizeLng(rawLng1);
		const lng2 = normalizeLng(rawLng2);
		
		// Calculate the direct difference
		const directDiff = lng2 - lng1;
		
		// If the difference is more than 180 degrees, it's shorter to go the other way
		// But we want to keep the line visible on the map, so we don't cross the date line
		let finalLng2 = lng2;
		
		if (Math.abs(directDiff) > 180) {
			// The points are far apart - keep them as they are for visual clarity
			// This will draw the "long way" but keeps the line visible on the map
			finalLng2 = lng2;
		}
		
		return [
			[lat1, lng1],
			[lat2, finalLng2]
		];
	};

	let polylinePositions = null;
	if (guess && correct) {
		polylinePositions = getShortestPath(guess, correct);
	}
	
	const worldBounds = [
		[-85, -180],
		[85, 180]
	];

	const normalizeLng = (lng) => {
		let normalized = ((lng + 180) % 360) - 180;
		if (normalized < -180) normalized += 360;
		return normalized;
	};
	
	return (
		<MapContainer
			center={guess || [20, 0]}
			zoom={2}
			style={{ height: 520, width: 880 }}
			attributionControl={false}
			maxBounds={worldBounds}
			maxBoundsViscosity={1.0}
		>
			<TileLayer 
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				noWrap={true}
				bounds={worldBounds}
			/>
			<MapController guess={guess} correct={correct} />
			{guess && <Marker position={[guess[0], normalizeLng(guess[1])]} icon={USER_MARKER} />}
			{correct && <Marker position={[correct[0], normalizeLng(correct[1])]} icon={GREEN_MARKER} />}
			{polylinePositions && <Polyline positions={polylinePositions} color="red" weight={3} />}
		</MapContainer>
	);
}

export default App;
